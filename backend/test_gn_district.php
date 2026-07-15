<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$nullDC = \App\Models\GramaNiladhari::whereNull('district_code')->count();
$notNullDC = \App\Models\GramaNiladhari::whereNotNull('district_code')->count();
echo "Null district_code: $nullDC\n";
echo "Not null district_code: $notNullDC\n";

$colombo = \App\Models\GramaNiladhari::where('district_code', 'LK11')->count();
echo "LK11 (Colombo): $colombo\n";
