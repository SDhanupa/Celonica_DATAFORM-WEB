<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Police;
use App\Models\GramaNiladhari;
use Illuminate\Support\Facades\DB;

$polices = Police::all();
$updated = 0;

foreach ($polices as $police) {
    // Try matching by modified ID
    $gndCode = str_replace('-', '', $police->gnd_id);
    $gnd = GramaNiladhari::where('code', $gndCode)->first();
    
    // If not found by ID, try matching by english name as fallback
    if (!$gnd) {
        $gnd = GramaNiladhari::where('name_en', $police->name)->first();
    }

    if ($gnd) {
        $police->ccode = $gnd->CCODE;
        $police->save();
        $updated++;
    }
}

echo "Updated $updated police records with correct CCODE.\n";
