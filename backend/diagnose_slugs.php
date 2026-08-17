<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

// Load prod slugs
$slugsFile = __DIR__ . '/prod_slugs.json';
$slugsMap = json_decode(file_get_contents($slugsFile), true);

// Only show MISMATCHED categories (found locally but slug is wrong)
$mismatchedSlug = [];
$alreadyCorrect = 0;
$notFound = 0;

foreach ($slugsMap as $name => $prodSlug) {
    $localCat = Category::where('name_en', trim($name))->first();

    if ($localCat) {
        if ($localCat->slug !== $prodSlug) {
            $mismatchedSlug[] = [
                'name' => $name,
                'local_slug' => $localCat->slug,
                'prod_slug' => $prodSlug
            ];
        } else {
            $alreadyCorrect++;
        }
    } else {
        $notFound++;
    }
}

echo "=== ALREADY CORRECT: {$alreadyCorrect} ===\n";
echo "=== NOT FOUND IN LOCAL DB: {$notFound} ===\n";
echo "=== MISMATCHED (found locally, wrong slug): " . count($mismatchedSlug) . " ===\n\n";

foreach ($mismatchedSlug as $m) {
    echo "Name: {$m['name']}\n  LOCAL:  {$m['local_slug']}\n  PROD:   {$m['prod_slug']}\n\n";
}

// Also show boundary-related categories in local DB with their current slugs
echo "\n\n=== LOCAL CATEGORIES WITH 'Boundary' in name (Current Slugs) ===\n";
$boundaryCats = Category::where('name_en', 'like', '%Boundar%')->get(['id','name_en','slug']);
foreach ($boundaryCats as $c) {
    echo "  [{$c->id}] {$c->name_en}\n       Slug: {$c->slug}\n";
    // Check if this exists in prod map
    $prodSlug = $slugsMap[$c->name_en] ?? 'NOT IN PROD JSON';
    echo "       Prod: {$prodSlug}\n";
}
