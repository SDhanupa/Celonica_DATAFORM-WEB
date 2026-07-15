<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$districts = App\Models\GramaNiladhari::select('dis_en')->whereNotNull('dis_en')->distinct()->get();
echo json_encode([
    'count' => $districts->count(),
    'districts' => $districts->pluck('dis_en')
], JSON_PRETTY_PRINT);
