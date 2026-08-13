<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = Illuminate\Http\Request::create('/api/category-data/ppss-playground', 'GET', ['gn_id' => 'WCCSA']); 
$ctrl = app(\App\Http\Controllers\CategoryDataUploadController::class); 
echo $ctrl->getData($req, 'ppss-playground')->getContent();
