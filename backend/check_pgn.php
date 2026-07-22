<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$gn = App\Models\GramaNiladhari::where('name_en', 'Pahalagama')->where('ds_en', 'Thambuththegama')->first();
if($gn) {
    echo "GN Found: " . $gn->id . "\n";
    $pGn = App\Models\PGn::where('grama_niladhari_id', $gn->id)->first();
    if ($pGn) {
        echo json_encode($pGn, JSON_PRETTY_PRINT);
    } else {
        echo "No PGn data found for this GN.\n";
    }
} else {
    echo "GN not found\n";
}
