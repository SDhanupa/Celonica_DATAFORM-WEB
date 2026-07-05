<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $response = Illuminate\Support\Facades\Http::post('http://127.0.0.1:8000/graphql', [
        'query' => 'query { categories { id slug nameEn nameSi imagePath sortOrder children { id } } }'
    ]);
    echo $response->body();
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
