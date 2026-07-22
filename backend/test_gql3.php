<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pDistrict = App\Models\PDistrict::where('admin2Name_en', 'Anuradhapura')->first();

$request = Illuminate\Http\Request::create('/graphql', 'POST', [
    'query' => '{ pDistrict(id: ' . $pDistrict->id . ') { gramaNiladharis { id nameEn pGn { gnName populationBoth age_0_14 age_15_59 } } } }'
]);
$response = app()->handle($request);
$data = json_decode($response->getContent(), true);

foreach($data['data']['pDistrict']['gramaNiladharis'] as $g) {
    if ($g['id'] == 11460) {
        echo "Found Pahalagama (11460) in GraphQL response:\n";
        print_r($g);
        break;
    }
}
