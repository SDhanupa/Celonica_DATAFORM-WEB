<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$gn = \App\Models\GramaNiladhari::find(11460);
echo json_encode([
    'id' => $gn->id,
    'name' => $gn->name_en,
    'ds' => $gn->ds_en,
    'district_id' => $gn->p_district_id,
    'has_unit' => $gn->housingUnitType ? true : false,
    'has_toilet' => $gn->toiletFacility ? true : false,
    'has_water' => $gn->drinkingWaterSource ? true : false,
    'has_waste' => $gn->solidWasteDisposal ? true : false,
], JSON_PRETTY_PRINT);
