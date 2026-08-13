<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SolidWasteDisposal;

echo "Sum for Kothmale:\n";
$sumLocalAuth = SolidWasteDisposal::where('ds_division', 'ILIKE', '%Kothmale%')->sum('collected_by_local_authorities');
$sumBurn = SolidWasteDisposal::where('ds_division', 'ILIKE', '%Kothmale%')->sum('occupants_burn');
$sumBury = SolidWasteDisposal::where('ds_division', 'ILIKE', '%Kothmale%')->sum('occupants_bury');
$sumCompost = SolidWasteDisposal::where('ds_division', 'ILIKE', '%Kothmale%')->sum('occupants_composting');

echo "Local Auth: $sumLocalAuth\n";
echo "Burn: $sumBurn\n";
echo "Bury: $sumBury\n";
echo "Compost: $sumCompost\n";

echo "\nFind by exact matches:\n";
$exact = SolidWasteDisposal::where('collected_by_local_authorities', 191)->get();
foreach ($exact as $row) {
    echo "Found GN with Local Auth 191: " . $row->gn_name . " in " . $row->ds_division . "\n";
}
