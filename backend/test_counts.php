<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Districts: " . \App\Models\District::count() . "\n";
echo "DS Divisions: " . \App\Models\DsDivision::count() . "\n";
echo "GNs: " . \App\Models\GramaNiladhari::count() . "\n";
