<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$ds = Illuminate\Support\Facades\DB::table('grama_niladharis')->where('ds_en', 'Ambalangoda')->value('dis_en');
echo "Ambalangoda maps to: " . $ds . "\n";
