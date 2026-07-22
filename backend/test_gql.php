<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/graphql', 'POST', [
    'query' => '{ pDistrict(id: 2) { gramaNiladharis { id nameEn pGn { gnName populationBoth age_0_14 age_15_59 } } } }'
]);
$response = app()->handle($request);
echo $response->getContent();
