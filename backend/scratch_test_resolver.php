<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$args = ['lat' => 6.9343, 'lng' => 79.9808];
$resolver = new \App\GraphQL\Queries\GnByCoordinates();
$result = $resolver(null, $args);
echo json_encode($result);
