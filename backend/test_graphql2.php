<?php
$lat = 6.9318;
$lng = 79.8863;
$resolver = new \App\GraphQL\Queries\GnByCoordinates();
$gn = $resolver(null, ['lat' => $lat, 'lng' => $lng]);
if ($gn) {
    echo "Found GN: {$gn->name_en} ({$gn->id})\n";
    $pDistrict = $gn->pDistrict;
    if ($pDistrict) {
        echo "Has pDistrict: {$pDistrict->admin2NameEn}\n";
    } else {
        echo "No pDistrict attached!\n";
    }
} else {
    echo "Not found!\n";
}
