<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
ini_set('memory_limit', '128M');
$start = microtime(true);
$query = file_get_contents('../extracted_query.txt');
$response = Illuminate\Support\Facades\Http::post('http://localhost:8000/graphql', ['query' => $query, 'variables' => ['id' => 2]]);
echo "Time: " . (microtime(true) - $start) . " seconds\n";
echo "Status: " . $response->status() . "\n";
echo "Memory: " . memory_get_peak_usage(true)/1024/1024 . " MB\n";
