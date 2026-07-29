<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$schema = DB::select("SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'grama_niladharis' AND column_name = 'CCODE'");
print_r($schema);
