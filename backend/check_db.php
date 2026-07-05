<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "ALL USERS:\n";
foreach (App\Models\User::all() as $u) echo $u->toJson() . PHP_EOL;
echo "ALL ADMINS:\n";
foreach (App\Models\Admin::all() as $a) echo $a->toJson() . PHP_EOL;
