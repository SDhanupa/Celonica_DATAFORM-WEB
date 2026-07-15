<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$data = App\Models\GramaNiladhari::select('dis_en', 'DCCODE')->distinct()->get()->groupBy('dis_en');
$res = [];
foreach ($data as $dis => $codes) {
    $res[$dis] = $codes->pluck('DCCODE')->toArray();
}
echo json_encode($res, JSON_PRETTY_PRINT);
