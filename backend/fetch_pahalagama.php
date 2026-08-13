<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$gn = \App\Models\GramaNiladhari::where('name_en', 'Pahalagama')->where('ds_en', 'Thambuththegama')->first();
if (!$gn) {
    // Try without ds_en or with different spelling
    $gn = \App\Models\GramaNiladhari::where('name_en', 'Pahalagama')->first();
}

if($gn) {
    $data = [
        'gn' => $gn->toArray(),
        'religiousAffiliation' => $gn->religiousAffiliation ? $gn->religiousAffiliation->toArray() : null,
    ];
    echo json_encode($data, JSON_PRETTY_PRINT);
} else {
    echo "GN not found";
}
