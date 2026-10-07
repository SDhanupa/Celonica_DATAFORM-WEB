<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

DB::enableQueryLog();

$request = Illuminate\Http\Request::create('/api/guest-token', 'GET');
$response = app()->handle($request);
$data = json_decode($response->getContent(), true);
$token = $data['token'];

$query = <<<'EOD'
  query GetGnByCoordinates($lat: Float!, $lng: Float!) {
    gnByCoordinates(lat: $lat, lng: $lng) {
      id
      code
      boundary { polygons }
      pDistrict { id }
      pGn { id }
      gnEconomy { id }
      housingOwnershipStatus { id }
      housingWallType { id }
      housingUnitType { id }
      toiletFacility { id }
      drinkingWaterSource { id }
      solidWasteDisposal { id }
      roomsInHousingUnit { id }
      housingRoofType { id }
      religiousAffiliation { id }
      householdHeadRelationship { id }
    }
  }
EOD;

$start = microtime(true);
$request2 = Illuminate\Http\Request::create('/graphql', 'POST', [
    'query' => $query,
    'variables' => ['lat' => 6.9343, 'lng' => 79.9808]
]);
$request2->headers->set('Authorization', 'Bearer ' . $token);
$response2 = app()->handle($request2);
echo "Full query took: " . (microtime(true) - $start) . " seconds\n";

$queries = DB::getQueryLog();
usort($queries, function($a, $b) {
    return $b['time'] <=> $a['time']; // Sort by time descending
});

foreach (array_slice($queries, 0, 5) as $q) {
    echo "Time: {$q['time']}ms - Query: {$q['query']}\n";
}
