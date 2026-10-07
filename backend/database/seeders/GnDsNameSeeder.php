<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Fills grama_niladharis.ds_en/ds_si/ds_ta (plus dis_* and pro_*) which
 * GramaNiladhariSeeder leaves empty because gm_divisions.json only carries codes.
 *
 * 1. English DS name per divisional_secretariat_code: match GNs by
 *    (gn name, district) against gn_population.json and take the majority ds_name.
 * 2. Sinhala/Tamil names: looked up by (district, ds_en) in
 *    grama_niladharis_update.json (a production export – its ids do NOT match local ids).
 *
 * Run before PGnSeeder, which links population rows using ds_en.
 */
class GnDsNameSeeder extends Seeder
{
    private function norm(?string $s): string
    {
        $n = preg_replace('/[^a-z0-9]/', '', strtolower((string) $s));
        // Spelling variants between data sources
        return strtr($n, ['moneragala' => 'monaragala']);
    }

    public function run(): void
    {
        $popPath = database_path('data/gn_population.json');
        $trPath = database_path('data/gn_admin_names.json');
        if (!file_exists($popPath) || !file_exists($trPath)) {
            $this->command->warn("Missing $popPath or $trPath");
            return;
        }

        // Districts: code => English name
        $districts = DB::table('p_district')->pluck('admin2Name_en', 'admin2Pcode');

        // --- Translation dictionaries from the production export ---
        $disTr = [];   // norm(dis_en) => [pro_en, pro_si, pro_ta, dis_en, dis_si, dis_ta]
        $dsTr = [];    // norm(dis_en)|norm(ds_en) => [ds_en, ds_si, ds_ta]
        $dsTrAny = []; // norm(ds_en) => [...] fallback
        foreach (json_decode(file_get_contents($trPath), true) as $r) {
            $d = $this->norm($r['dis_en'] ?? '');
            if ($d === '') continue;
            $disTr[$d] ??= array_map('trim', [
                $r['pro_en'] ?? '', $r['pro_si'] ?? '', $r['pro_ta'] ?? '',
                $r['dis_en'] ?? '', $r['dis_si'] ?? '', $r['dis_ta'] ?? '',
            ]);
            $s = $this->norm($r['ds_en'] ?? '');
            if ($s === '') continue;
            $val = array_map('trim', [$r['ds_en'], $r['ds_si'] ?? '', $r['ds_ta'] ?? '']);
            $dsTr["$d|$s"] ??= $val;
            $dsTrAny[$s] ??= $val;
        }

        // --- Census: norm(gn)|norm(district) => list of ds names ---
        $census = [];
        foreach (json_decode(file_get_contents($popPath), true) as $r) {
            $census[$this->norm($r['gn_name']) . '|' . $this->norm($r['district_name'])][] = trim($r['ds_name']);
        }

        // --- Vote per DS code ---
        $votes = [];
        $gns = DB::table('grama_niladharis')->select('id', 'name_en', 'district_code', 'divisional_secretariat_code')->get();
        foreach ($gns as $gn) {
            $key = $this->norm($gn->name_en) . '|' . $this->norm($districts[$gn->district_code] ?? '');
            foreach ($census[$key] ?? [] as $ds) {
                $votes[$gn->divisional_secretariat_code][$ds] = ($votes[$gn->divisional_secretariat_code][$ds] ?? 0) + 1;
            }
        }

        $dsNames = []; // ds code => [en, si, ta]
        $unresolved = [];
        $dsDistrict = $gns->pluck('district_code', 'divisional_secretariat_code');
        foreach ($dsDistrict as $dsCode => $disCode) {
            if (empty($votes[$dsCode])) { $unresolved[] = $dsCode; continue; }
            arsort($votes[$dsCode]);
            $en = array_key_first($votes[$dsCode]);
            $d = $this->norm($districts[$disCode] ?? '');
            $dsNames[$dsCode] = $dsTr["$d|" . $this->norm($en)] ?? $dsTrAny[$this->norm($en)] ?? [$en, '', ''];
        }

        // --- Apply updates per DS code ---
        DB::transaction(function () use ($dsNames, $dsDistrict, $districts, $disTr) {
            foreach ($dsDistrict as $dsCode => $disCode) {
                $upd = [];
                if ($t = $disTr[$this->norm($districts[$disCode] ?? '')] ?? null) {
                    [$upd['pro_en'], $upd['pro_si'], $upd['pro_ta'], $upd['dis_en'], $upd['dis_si'], $upd['dis_ta']] = $t;
                }
                if (isset($dsNames[$dsCode])) {
                    [$upd['ds_en'], $upd['ds_si'], $upd['ds_ta']] = $dsNames[$dsCode];
                }
                if ($upd) {
                    DB::table('grama_niladharis')->where('divisional_secretariat_code', $dsCode)->update($upd);
                }
            }
        });

        $this->command->info('DS codes resolved: ' . count($dsNames) . ' / ' . count($dsDistrict));
        if ($unresolved) {
            $this->command->warn('Unresolved DS codes: ' . implode(', ', $unresolved));
        }
    }
}
