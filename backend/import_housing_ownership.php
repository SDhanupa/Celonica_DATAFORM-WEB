<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\HousingOwnershipStatus;
use Illuminate\Support\Facades\DB;

$jsonFilePath = __DIR__ . '/housing_ownership_data.json';

if (!file_exists($jsonFilePath)) {
    die("JSON file not found at $jsonFilePath\n");
}

$jsonData = file_get_contents($jsonFilePath);
$records = json_decode($jsonData, true);

if (!$records) {
    die("Failed to decode JSON data.\n");
}

echo "Found " . count($records) . " records to import.\n";

DB::beginTransaction();

try {
    // Clear existing data to prevent duplicates if run multiple times
    HousingOwnershipStatus::truncate();
    
    $chunkSize = 1000;
    $chunks = array_chunk($records, $chunkSize);
    
    $totalImported = 0;
    
    foreach ($chunks as $chunk) {
        HousingOwnershipStatus::insert($chunk);
        $totalImported += count($chunk);
        echo "Imported $totalImported / " . count($records) . "...\n";
    }
    
    DB::commit();
    echo "\nSuccessfully imported all $totalImported records!\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error during import: " . $e->getMessage() . "\n";
}
