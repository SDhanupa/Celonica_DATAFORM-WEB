<?php
$lat = 6.9318;
$lng = 79.8863;
$candidates = DB::table('gn_divisions')
    ->where('min_lat', '<=', $lat)
    ->where('max_lat', '>=', $lat)
    ->where('min_lng', '<=', $lng)
    ->where('max_lng', '>=', $lng)
    ->get(['id', 'name', 'district', 'min_lat', 'max_lat']);

echo count($candidates) . " candidates found.\n";
foreach ($candidates as $c) {
    echo "{$c->id} - {$c->name} ({$c->district})\n";
}
