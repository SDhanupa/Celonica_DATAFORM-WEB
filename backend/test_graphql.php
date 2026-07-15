<?php
$lat = 6.9318;
$lng = 79.8863;
$resolver = new \App\GraphQL\Queries\GnByCoordinates();
$result = $resolver(null, ['lat' => $lat, 'lng' => $lng]);
if ($result) {
    echo "Found GN: " . $result->name_en . "\n";
} else {
    echo "Not found!\n";
}
