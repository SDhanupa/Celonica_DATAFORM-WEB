<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$jsonFile = 'trs_areas.json';
$data = json_decode(file_get_contents($jsonFile), true);
$matches = 0;
foreach ($data as $item) {
    $enName = $item['name_en'] ?? '';
    $prefix = trim(str_replace([
        '- Regional Management Office Area', 
        'Regional Management Office Area', 
        '- Local Exchange Area', 
        'Local Exchange Area', 
        '-'
    ], '', $enName));
    
    $count = Illuminate\Support\Facades\DB::table('grama_niladharis')
        ->where('name_en', $prefix)
        ->count();
        
    if ($count > 0) $matches++;
}

echo "Exact matches with GND name_en: $matches out of " . count($data) . "\n";
