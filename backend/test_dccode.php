<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$counts = Illuminate\Support\Facades\DB::table('grama_niladharis')
    ->select('dis_en', 'DCCODE', Illuminate\Support\Facades\DB::raw('count(*) as total'))
    ->whereNotNull('dis_en')
    ->groupBy('dis_en', 'DCCODE')
    ->get();

$districts = $counts->groupBy('dis_en')->map(function ($g) {
    return $g->sortByDesc('total')->first();
});

echo json_encode($districts->pluck('DCCODE', 'dis_en'), JSON_PRETTY_PRINT);
