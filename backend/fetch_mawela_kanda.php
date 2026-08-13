<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$gn = \App\Models\GramaNiladhari::where('name_en', 'Mawela Kanda')->first();
if($gn && $gn->pGn) {
    echo json_encode($gn->pGn->toArray(), JSON_PRETTY_PRINT);
} else {
    echo "Not found";
}
