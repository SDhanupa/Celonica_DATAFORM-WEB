<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$query = file_get_contents('../extracted_query.txt');
$variables = ['id' => 11]; // using 11 for Colombo district code LK11 as an example

$request = Illuminate\Http\Request::create('/graphql', 'POST', [
    'query' => $query,
    'variables' => $variables
]);
$response = app()->handle($request);

$content = json_decode($response->getContent(), true);
file_put_contents('../extracted_query_result.json', json_encode($content, JSON_PRETTY_PRINT));
echo "Query executed and results saved to ../extracted_query_result.json\n";
