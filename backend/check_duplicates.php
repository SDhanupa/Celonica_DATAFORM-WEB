<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$duplicates = DB::table('grama_niladharis')
    ->select('CCODE', DB::raw('COUNT(*) as count'))
    ->groupBy('CCODE')
    ->havingRaw('COUNT(*) > 1')
    ->get();

if ($duplicates->count() > 0) {
    echo "Warning: Duplicates found!\n";
    foreach ($duplicates as $dup) {
        if ($dup->CCODE !== null && $dup->CCODE !== '') {
            echo $dup->CCODE . " : " . $dup->count . "\n";
        }
    }
} else {
    echo "Success: No duplicates found in the entire table!\n";
}
