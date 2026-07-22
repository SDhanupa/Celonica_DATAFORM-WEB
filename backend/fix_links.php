<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\GramaNiladhari;

$tables = [
    'App\Models\HousingOwnershipStatus',
    'App\Models\HousingWallType',
    'App\Models\HousingUnitType',
    'App\Models\ToiletFacility',
    'App\Models\DrinkingWaterSource',
    'App\Models\SolidWasteDisposal',
];

// Cache all GNs for fast matching
$allGns = GramaNiladhari::select('id', 'name_en', 'ds_en', 'dis_en')->get();

foreach ($tables as $modelClass) {
    echo "Processing $modelClass...\n";
    $records = $modelClass::whereNull('gn_id')->get();
    
    $matched = 0;
    foreach ($records as $record) {
        $gnName = preg_replace('/^[\d\w]+\s*-\s*/', '', trim($record->gn_name));
        $ds = trim($record->ds_division);
        $district = trim($record->district);
        
        $bestMatchId = null;
        $bestScore = -1;
        
        foreach ($allGns as $gn) {
            // First check district match roughly
            if (stripos($gn->dis_en ?? '', $district) === false && stripos($district, $gn->dis_en ?? '') === false) {
                continue;
            }
            
            // Check DS match (allow slight misspelling)
            similar_text(strtolower($gn->ds_en), strtolower($ds), $dsScore);
            if ($dsScore > 80) {
                // Check GN Name match
                similar_text(strtolower($gn->name_en), strtolower($gnName), $gnScore);
                if ($gnScore > 85) {
                    $totalScore = $dsScore + $gnScore;
                    if ($totalScore > $bestScore) {
                        $bestScore = $totalScore;
                        $bestMatchId = $gn->id;
                    }
                }
            }
        }
        
        if ($bestMatchId) {
            $record->gn_id = $bestMatchId;
            $record->save();
            $matched++;
        }
    }
    
    echo "Matched $matched out of " . count($records) . " records for $modelClass.\n";
}
