<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%playground%'");
echo json_encode($tables);
