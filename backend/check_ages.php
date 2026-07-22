<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$count014 = App\Models\PGn::whereNotNull('age_0_14')->count();
$total = App\Models\PGn::count();

echo "Total p_gns: $total\n";
echo "Total with age_0_14: $count014\n";

// check how many have age_0_14 > 0
$count014_above0 = App\Models\PGn::where('age_0_14', '>', 0)->count();
echo "Total with age_0_14 > 0: $count014_above0\n";
