<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\DrinkingWaterSource;
use App\Models\GramaNiladhari;
use Illuminate\Support\Facades\DB;

$jsonFile = __DIR__.'/drinking_water_data.json';
if (!file_exists($jsonFile)) {
    die("Error: JSON file not found.\n");
}

$jsonData = file_get_contents($jsonFile);
$records = json_decode($jsonData, true);

if (!$records) {
    die("Error: Invalid JSON format.\n");
}

$totalCount = count($records);
echo "Starting to import $totalCount records...\n";

// Disable query log to save memory
DB::connection()->disableQueryLog();

$matchedCount = 0;

foreach ($records as $index => $record) {
    if ($index > 0 && $index % 500 === 0) {
        echo "Processed $index / $totalCount records... (Matched: $matchedCount)\n";
    }

    $gnName = trim($record['gn_name']);
    $dsDivision = trim($record['ds_division']);
    $district = trim($record['district']);

    $normalizedGnName = preg_replace('/^[\d\w]+\s*-\s*/', '', $gnName);

    $gn = GramaNiladhari::where(function($query) use ($normalizedGnName) {
            $query->where('name_en', 'ILIKE', "%{$normalizedGnName}%")
                  ->orWhere('name_si', 'ILIKE', "%{$normalizedGnName}%")
                  ->orWhere('name_ta', 'ILIKE', "%{$normalizedGnName}%");
        })
        ->where('ds_en', 'ILIKE', "%{$dsDivision}%")
        ->where('dis_en', 'ILIKE', "%{$district}%")
        ->first();

    $gnId = $gn ? $gn->id : null;
    if ($gnId) {
        $matchedCount++;
    }

    DrinkingWaterSource::create([
        'gn_id' => $gnId,
        'gn_name' => $record['gn_name'],
        'ds_division' => $record['ds_division'],
        'district' => $record['district'],
        'province' => $record['province'],
        'total_households' => $record['total_households'],
        'protected_well_within' => $record['protected_well_within'],
        'protected_well_outside' => $record['protected_well_outside'],
        'unprotected_well' => $record['unprotected_well'],
        'tap_within_unit' => $record['tap_within_unit'],
        'tap_within_premises_outside' => $record['tap_within_premises_outside'],
        'tap_outside_premises' => $record['tap_outside_premises'],
        'rural_water_projects' => $record['rural_water_projects'],
        'tube_well' => $record['tube_well'],
        'bowser' => $record['bowser'],
        'river_tank_stream' => $record['river_tank_stream'],
        'other' => $record['other']
    ]);
}

echo "Import complete! Inserted $totalCount records. Matched $matchedCount GNs.\n";
