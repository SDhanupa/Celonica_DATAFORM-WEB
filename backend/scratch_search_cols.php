<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$res = DB::select("SELECT table_name, column_name FROM information_schema.columns WHERE column_name LIKE '%lat%' OR column_name LIKE '%lng%' OR column_name LIKE '%lon%'");
echo json_encode($res);
