<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tableName = 'category_data_village_boundaries';
$hasTable = Illuminate\Support\Facades\Schema::hasTable($tableName);

echo "Has table? " . ($hasTable ? "YES" : "NO") . "\n";
