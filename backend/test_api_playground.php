<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = Illuminate\Http\Request::create('/api/category-data/ppss-playground', 'GET', ['gn_id' => 'WCCSA', 'district_id' => 1, 'ds_division_code' => 'LK1103']); 
$ctrl = app(\App\Http\Controllers\CategoryDataUploadController::class); 
echo $ctrl->getData($req, 'ppss-playground')->getContent();
