<?php
$lat = 6.9318;
$lng = 79.8863;
$candidates = DB::table('gn_divisions')
    ->where('min_lat', '<=', $lat)
    ->where('max_lat', '>=', $lat)
    ->where('min_lng', '<=', $lng)
    ->where('max_lng', '>=', $lng)
    ->get(['id', 'name', 'district', 'min_lat', 'max_lat', 'polygons', 'details']);

function pointInPolygon($point, $polygon) {
    $x = $point[0]; // lng
    $y = $point[1]; // lat
    $inside = false;
    
    if (isset($polygon[0][0]) && is_array($polygon[0][0])) {
        $polygon = $polygon[0];
    }

    for ($i = 0, $j = count($polygon) - 1; $i < count($polygon); $j = $i++) {
        if (!isset($polygon[$i][0]) || !isset($polygon[$j][0])) continue;
        
        $xi = $polygon[$i][0];
        $yi = $polygon[$i][1];
        $xj = $polygon[$j][0];
        $yj = $polygon[$j][1];

        $intersect = (($yi > $y) != ($yj > $y))
            && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi);
        if ($intersect) {
            $inside = !$inside;
        }
    }
    return $inside;
}

$found = null;
foreach ($candidates as $c) {
    $polygons = json_decode($c->polygons, true);
    if (!is_array($polygons)) continue;
    
    foreach ($polygons as $polygon) {
        if (pointInPolygon([$lng, $lat], $polygon)) {
            $found = $c;
            break 2;
        }
    }
}

if ($found) {
    echo "Found GN Division inside DB polygons: {$found->name}\n";
    $details = json_decode($found->details, true);
    $gnCode = $details['GND_NO_Cen'] ?? null;
    $districtName = explode(' ', $found->district)[0];
    echo "GN Code: {$gnCode}, District: {$districtName}\n";
    
    $district = DB::table('p_district')->where('admin2Name_en', 'ilike', '%' . $districtName . '%')->first();
    if ($district) {
        echo "District PCode: {$district->admin2Pcode}\n";
        $gn = \App\Models\GramaNiladhari::where('district_code', $district->admin2Pcode)
            ->where('code', 'like', '%' . $gnCode . '%')
            ->first();
        if ($gn) {
            echo "Found in grama_niladharis table: {$gn->name_en} ({$gn->code})\n";
        } else {
            echo "Not found by code. Trying by name...\n";
            $cleanName = trim(preg_replace('/[0-9A-Za-z]?$/', '', $found->name));
            $gn2 = \App\Models\GramaNiladhari::where('district_code', $district->admin2Pcode)
                ->where('name_en', 'like', '%' . $cleanName . '%')
                ->first();
            if ($gn2) {
                echo "Found by name: {$gn2->name_en}\n";
            } else {
                echo "Not found by name either.\n";
            }
        }
    } else {
        echo "District not found in p_district.\n";
    }
} else {
    echo "Point not inside any polygon.\n";
}
