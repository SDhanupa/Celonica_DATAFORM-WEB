<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

// Check boundary categories in the DB
$cats = Category::where('name_en', 'like', '%boundary%')
    ->orWhere('name_en', 'like', '%Boundary%')
    ->get(['id', 'name_en', 'slug']);

echo "=== BOUNDARY CATEGORIES IN DB ===\n";
foreach ($cats as $c) {
    echo "ID: {$c->id} | Name: {$c->name_en} | Slug: {$c->slug}\n";
}

echo "\n=== TOTAL: {$cats->count()} ===\n";

// Also check what slug format boundary items should have
$slugsFile = __DIR__ . '/prod_slugs.json';
$slugsMap = json_decode(file_get_contents($slugsFile), true);

echo "\n=== BOUNDARY SLUGS IN PROD JSON ===\n";
foreach ($slugsMap as $name => $slug) {
    if (stripos($name, 'boundary') !== false || stripos($slug, 'boundary') !== false) {
        echo "Name: {$name} | Slug: {$slug}\n";
    }
}

// Check for categories with slugs containing "boundary" already
echo "\n=== DB CATEGORIES WITH 'boundary' IN SLUG ===\n";
$byCats = Category::where('slug', 'like', '%boundary%')->get(['id', 'name_en', 'slug']);
foreach ($byCats as $c) {
    echo "ID: {$c->id} | Name: {$c->name_en} | Slug: {$c->slug}\n";
}
echo "Total: {$byCats->count()}\n";

// Show some sample categories to understand data structure
echo "\n=== SAMPLE - First 5 categories with their slugs ===\n";
$samples = Category::take(5)->get(['id', 'name_en', 'slug', 'parent_id']);
foreach ($samples as $c) {
    echo "ID: {$c->id} | Parent: {$c->parent_id} | Name: {$c->name_en} | Slug: {$c->slug}\n";
}

// Check how many categories have no slug or wrong format
$total = Category::count();
$withSlug = Category::whereNotNull('slug')->where('slug', '!=', '')->count();
$locationSlugs = Category::where('slug', 'like', 'location-%')->count();

echo "\n=== STATS ===\n";
echo "Total categories: {$total}\n";
echo "With slug: {$withSlug}\n";
echo "With location-* slug: {$locationSlugs}\n";
