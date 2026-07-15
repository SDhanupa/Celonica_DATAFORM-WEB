<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$districtName = 'Anuradhapura';
$gnName = 'Pahalagama'; // We'll search across all Pahalagamas in Anuradhapura

$district = \App\Models\PDistrict::where('admin2Name_en', 'ilike', '%' . $districtName . '%')->first();
$gns = \App\Models\GramaNiladhari::where('district_code', $district->admin2Pcode)
    ->where('name_en', 'ilike', '%' . $gnName . '%')
    ->get();

$allData = [];

foreach ($gns as $gn) {
    $data = [
        'GramaNiladhari (Main Table)' => $gn->toArray(),
        'PDistrict (District Table)' => $gn->pDistrict ? $gn->pDistrict->toArray() : null,
        'Police (Police Station)' => $gn->police ? $gn->police->toArray() : null,
        'PostOffice' => $gn->postOffice ? $gn->postOffice->toArray() : null,
        'PGn (Population Data)' => $gn->pGn ? $gn->pGn->toArray() : null,
    ];

    $phi = \Illuminate\Support\Facades\DB::table('phi_areas')->where('code', $gn->code)->first();
    if ($phi) $data['PhiArea'] = (array)$phi;

    $trs = \Illuminate\Support\Facades\DB::table('trs_areas')->where('code', $gn->code)->first();
    if ($trs) $data['TrsArea'] = (array)$trs;
    
    $allData[] = $data;
}

file_put_contents('output2.json', json_encode($allData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Done";
