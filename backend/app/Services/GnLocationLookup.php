<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class GnLocationLookup
{
    public function byCode(string $code): ?array
    {
        // Codes, not fuzzy names: duplicate village names must never select the wrong GN.
        $rows = DB::table('grama_niladharis')->where('CCODE', strtoupper($code))->orWhere('code', strtoupper($code))->limit(2)->get();
        return $rows->count() === 1 ? $this->format($rows->first()) : null;
    }

    public function resolve(float $lat, float $lng): ?array
    {
        $candidates = DB::table('gn_divisions')->where('min_lat', '<=', $lat)->where('max_lat', '>=', $lat)
            ->where('min_lng', '<=', $lng)->where('max_lng', '>=', $lng)->get();
        $matches = [];
        foreach ($candidates as $boundary) {
            $polygons = json_decode($boundary->polygons, true);
            if (!is_array($polygons)) continue;
            foreach ($polygons as $polygon) {
                if (!$this->contains($polygon, $lng, $lat)) continue;
                $details = json_decode($boundary->details, true);
                if (!isset($details['PROVINCE_C'], $details['DISTRICT_C'], $details['DSD_C'], $details['GND_C'])) return null;
                $code = 'LK' . $details['PROVINCE_C'] . $details['DISTRICT_C'] . $details['DSD_C'] . $details['GND_C'];
                $gn = $this->byCode($code);
                if (!$gn) return null;
                $matches[$gn['code']] = $gn;
            }
        }
        // A shared/overlapping boundary is ambiguous. Do not silently choose one of two GNs.
        if (count($matches) !== 1) return null;
        return ['coordinates' => ['latitude' => $lat, 'longitude' => $lng], 'match' => 'boundary', 'gn' => array_values($matches)[0]];
    }

    private function format(object $gn): array
    {
        $names = fn (string $prefix) => ['en' => $gn->{$prefix . '_en'} ?? null, 'si' => $gn->{$prefix . '_si'} ?? null, 'ta' => $gn->{$prefix . '_ta'} ?? null];
        return [
            'ccode' => $gn->CCODE, 'code' => $gn->code, 'name' => $names('name'),
            'province' => ['code' => $gn->province_code, 'ccode' => $gn->PCCODE ?? null, 'name' => $names('pro')],
            'district' => ['code' => $gn->district_code, 'ccode' => $gn->DCCODE ?? null, 'name' => $names('dis')],
            'division' => ['code' => $gn->divisional_secretariat_code, 'ccode' => $gn->DSCCODE ?? null, 'name' => $names('ds')],
            'village_path' => '/gnpage/' . rawurlencode(str_replace(' ', '-', $gn->name_en)) . '/' . rawurlencode($gn->CCODE),
        ];
    }

    private function contains(array $polygon, float $x, float $y): bool
    {
        if (!$polygon) return false;
        // Imported geometry supports a flat ring or [outer ring, hole, ...].
        $rings = isset($polygon[0][0]) && is_array($polygon[0][0]) ? $polygon : [$polygon];
        if (!$this->inRing($rings[0], $x, $y)) return false;
        foreach (array_slice($rings, 1) as $hole) if ($this->inRing($hole, $x, $y)) return false;
        return true;
    }

    private function inRing(array $ring, float $x, float $y): bool
    {
        $inside = false;
        for ($i = 0, $j = count($ring) - 1; $i < count($ring); $j = $i++) {
            if (!isset($ring[$i][0], $ring[$i][1], $ring[$j][0], $ring[$j][1])) continue;
            [$xi, $yi] = $ring[$i]; [$xj, $yj] = $ring[$j];
            $cross = ($x - $xi) * ($yj - $yi) - ($y - $yi) * ($xj - $xi);
            if (abs($cross) < 1e-12 && $x >= min($xi, $xj) && $x <= max($xi, $xj) && $y >= min($yi, $yj) && $y <= max($yi, $yj)) return true;
            if (($yi > $y) !== ($yj > $y) && $x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi) $inside = !$inside;
        }
        return $inside;
    }
}
