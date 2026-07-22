<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$gn = App\Models\GramaNiladhari::where('name_en', 'Pahalagama')->first();
echo "District ID: " . $gn->district_code . "\n";
$district = App\Models\PDistrict::where('district_code', $gn->district_code)->orWhere('id', $gn->district_code)->first();
if ($district) {
    echo "PDistrict ID: " . $district->id . "\n";
} else {
    echo "PDistrict not found.\n";
}
