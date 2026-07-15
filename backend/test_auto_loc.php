<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$app->make("Illuminate\Contracts\Console\Kernel")->bootstrap();

$lat = 8.1986;
$lng = 80.2826;
$candidates = \Illuminate\Support\Facades\DB::table("gn_divisions")
    ->where("min_lat", "<=", $lat)
    ->where("max_lat", ">=", $lat)
    ->where("min_lng", "<=", $lng)
    ->where("max_lng", ">=", $lng)
    ->get();

function pointInPolygon($point, $polygon) {
    $x = $point[0];
    $y = $point[1];
    $inside = false;
    if (isset($polygon[0][0]) && is_array($polygon[0][0])) {
        $polygon = $polygon[0];
    }
    for ($i = 0, $j = count($polygon) - 1; $i < count($polygon); $j = $i++) {
        if (!isset($polygon[$i][0]) || !isset($polygon[$j][0])) continue;
        $xi = $polygon[$i][0]; $yi = $polygon[$i][1];
        $xj = $polygon[$j][0]; $yj = $polygon[$j][1];
        $intersect = (($yi > $y) != ($yj > $y)) && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi);
        if ($intersect) $inside = !$inside;
    }
    return $inside;
}

foreach ($candidates as $c) {
    $polygons = json_decode($c->polygons, true);
    if (!is_array($polygons)) continue;
    foreach ($polygons as $polygon) {
        if (pointInPolygon([$lng, $lat], $polygon)) {
            echo "Found: " . $c->name . "\nDetails: " . $c->details . "\n";
            break 2;
        }
    }
}
