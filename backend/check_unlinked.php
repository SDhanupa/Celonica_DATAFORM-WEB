<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = [
    'App\Models\GnEconomy',
    'App\Models\HousingOwnershipStatus',
    'App\Models\HousingWallType',
    'App\Models\HousingUnitType',
    'App\Models\ToiletFacility',
    'App\Models\DrinkingWaterSource',
    'App\Models\SolidWasteDisposal',
];

foreach ($tables as $modelClass) {
    $total = $modelClass::count();
    $fk = ($modelClass === 'App\Models\GnEconomy') ? 'grama_niladhari_id' : 'gn_id';
    $unlinked = $modelClass::whereNull($fk)->count();
    echo class_basename($modelClass) . ": $unlinked unlinked out of $total\n";
}
