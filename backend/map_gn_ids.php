<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\HousingOwnershipStatus;
use App\Models\GramaNiladhari;
use Illuminate\Support\Facades\DB;

$statuses = HousingOwnershipStatus::all();

$matchedCount = 0;
$totalCount = $statuses->count();
echo "Starting to map $totalCount records...\n";

foreach ($statuses as $index => $status) {
    if ($index > 0 && $index % 500 === 0) {
        echo "Processed $index / $totalCount records...\n";
    }

    $gnName = trim($status->gn_name);
    $dsDivision = trim($status->ds_division);
    $district = trim($status->district);

    // Normalize GN name (remove numbers/codes if any)
    $normalizedGnName = preg_replace('/^[\d\w]+\s*-\s*/', '', $gnName);

    // Search in GramaNiladhari
    // We try to match name_en, ds_en, and dis_en. Use LIKE for flexibility or exact match.
    $gn = GramaNiladhari::where(function($query) use ($normalizedGnName) {
            $query->where('name_en', 'ILIKE', "%{$normalizedGnName}%")
                  ->orWhere('name_si', 'ILIKE', "%{$normalizedGnName}%")
                  ->orWhere('name_ta', 'ILIKE', "%{$normalizedGnName}%");
        })
        ->where('ds_en', 'ILIKE', "%{$dsDivision}%")
        ->where('dis_en', 'ILIKE', "%{$district}%")
        ->first();

    if ($gn) {
        $status->gn_id = $gn->id;
        $status->save();
        $matchedCount++;
    }
}

echo "Mapping complete! Matched $matchedCount out of $totalCount records.\n";
