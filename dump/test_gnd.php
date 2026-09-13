<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$count = Illuminate\Support\Facades\DB::table('grama_niladharis')->where('name_en', 'like', '%Ambalangoda%')->count();
echo "Count for Ambalangoda: " . $count . "\n";
