<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = new \App\Http\Controllers\CategoryTablesController();

echo "Testing Space (230):\n";
$response = $controller->getTablesForCategory('230');
echo $response->getContent() . "\n\n";

echo "Testing Boundaries (2):\n";
$response = $controller->getTablesForCategory('2');
echo $response->getContent() . "\n\n";
