<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$rows = DB::table('grama_niladharis')->where('CCODE', 'WGDKN')->get(['id', 'CCODE', 'name_en']);
print_r($rows->toArray());

$duplicates = DB::table('grama_niladharis')
    ->select('CCODE', DB::raw('COUNT(*) as count'))
    ->groupBy('CCODE')
    ->havingRaw('COUNT(*) > 1')
    ->get();

echo "Total duplicates groups in table: " . count($duplicates) . "\n";
