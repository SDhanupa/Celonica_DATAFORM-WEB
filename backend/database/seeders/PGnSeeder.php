<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PGn;
use App\Models\GramaNiladhari;

class PGnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents(database_path('data/gn_population.json'));
        $data = json_decode($json, true);

        // Pre-fetch all grama niladharis and index by GNName|DSName|DisName for O(1) lookup
        // We do this to avoid doing 14000 individual queries
        $gns = GramaNiladhari::select('id', 'name_en', 'ds_en', 'dis_en', 'CCODE')->get();
        $gnMap = [];
        $gnMapCcode = [];
        foreach ($gns as $gn) {
            $key = strtolower(trim($gn->name_en) . '|' . trim($gn->ds_en) . '|' . trim($gn->dis_en));
            if (!isset($gnMap[$key])) {
                $gnMap[$key] = $gn->id;
                $gnMapCcode[$key] = $gn->CCODE;
            }
        }

        $chunks = array_chunk($data, 500);

        foreach ($chunks as $chunk) {
            $insertData = [];
            foreach ($chunk as $row) {
                $key = strtolower(trim($row['gn_name']) . '|' . trim($row['ds_name']) . '|' . trim($row['district_name']));
                $gramaNiladhariId = $gnMap[$key] ?? null;
                $ccode = $gnMapCcode[$key] ?? null;

                $insertData[] = [
                    'grama_niladhari_id' => $gramaNiladhariId,
                    'CCODE' => $ccode,
                    'gn_name' => $row['gn_name'],
                    'population_both' => $row['population_both'],
                    'population_male' => $row['population_male'],
                    'population_female' => $row['population_female'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            PGn::insert($insertData);
        }
    }
}
