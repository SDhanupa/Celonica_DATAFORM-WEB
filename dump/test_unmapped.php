<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$unmapped = Illuminate\Support\Facades\DB::table('trs_areas')->whereNull('district')->pluck('name_en')->take(20)->toArray();
print_r($unmapped);
