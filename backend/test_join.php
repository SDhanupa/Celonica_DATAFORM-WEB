<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$result = DB::table('category_data_sapdsgv_village_boundaries')
    ->leftJoin('grama_niladharis', function($join) {
        $join->on('category_data_sapdsgv_village_boundaries.gn_id', '=', DB::raw('CAST(grama_niladharis.id AS varchar)'));
    })
    ->select('category_data_sapdsgv_village_boundaries.id', 'category_data_sapdsgv_village_boundaries.gn_id', 'grama_niladharis.dis_en as district_name', 'grama_niladharis.ds_en as ds_name', 'grama_niladharis.name_en as gn_name')
    ->orderBy('category_data_sapdsgv_village_boundaries.id', 'desc')
    ->limit(10)
    ->get();

echo json_encode($result);
