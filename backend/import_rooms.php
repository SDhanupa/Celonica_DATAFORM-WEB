<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\RoomsInHousingUnit;
use App\Models\GramaNiladhari;
use Illuminate\Support\Facades\DB;

$jsonFile = __DIR__.'/rooms_data.json';
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

    RoomsInHousingUnit::create([
        'grama_niladhari_id' => $gnId,
        'gn_name' => $record['gn_name'],
        'total_housing_units' => $record['total_housing_units'],
        'room_1' => $record['room_1'],
        'rooms_2' => $record['rooms_2'],
        'rooms_3' => $record['rooms_3'],
        'rooms_4' => $record['rooms_4'],
        'rooms_5' => $record['rooms_5'],
        'rooms_6' => $record['rooms_6'],
        'rooms_7' => $record['rooms_7'],
        'rooms_8' => $record['rooms_8'],
        'rooms_9' => $record['rooms_9'],
        'rooms_10_and_above' => $record['rooms_10_and_above'],
    ]);
}

echo "Import complete! Inserted $totalCount records. Matched $matchedCount GNs.\n";
