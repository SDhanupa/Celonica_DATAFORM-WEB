<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

// Show ALL categories that still have non-location-* slugs
// These are ones that were NOT updated by the prod sync
$cats = Category::where('slug', 'not like', 'location-%')->get(['id', 'name_en', 'slug', 'parent_id']);

echo "=== CATEGORIES WITH NON-LOCATION SLUGS (" . $cats->count() . " total) ===\n\n";
foreach ($cats as $c) {
    echo "[{$c->id}] Parent:{$c->parent_id} | {$c->name_en}\n  Slug: {$c->slug}\n";
}

echo "\n\n=== CATEGORIES WITH location-* SLUGS ===\n";
$locCats = Category::where('slug', 'like', 'location-%')->get(['id', 'name_en', 'slug', 'parent_id']);
echo "Total with location-* slugs: {$locCats->count()}\n\n";

// Show the hierarchy of the "Boundaries" tree to understand structure
echo "=== FULL TREE UNDER 'Boundaries' (ID 2) ===\n";
function printTree($parentId, $depth = 0) {
    $cats = Category::where('parent_id', $parentId)->get(['id', 'name_en', 'slug']);
    foreach ($cats as $c) {
        echo str_repeat("  ", $depth) . "[{$c->id}] {$c->name_en} => {$c->slug}\n";
        printTree($c->id, $depth + 1);
    }
}
printTree(2);
