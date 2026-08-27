<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Category;

$rootSlug = 'location-1-4';
$root = Category::where('slug', $rootSlug)->first();

if (!$root) {
    echo "ROOT NOT FOUND: $rootSlug\n";
    exit(1);
}

echo "Root found: {$root->name_en} (id:{$root->id})\n";

$all = Category::all()->keyBy('id');
echo "Total categories in DB: ".$all->count()."\n";

$result = [];
function collectDesc($cat, $ancestorNames, &$result, $allById) {
    $path = array_merge($ancestorNames, [$cat->name_en]);
    $result[] = [
        'id'         => (string) $cat->id,
        'slug'       => $cat->slug,
        'nameEn'     => $cat->name_en ?? '',
        'breadcrumb' => implode(' > ', $path),
        'depth'      => count($ancestorNames),
    ];
    $children = $allById->filter(fn($c) => $c->parent_id == $cat->id)->sortBy('sort_order');
    foreach ($children as $child) {
        collectDesc($child, $path, $result, $allById);
    }
}

collectDesc($root, [], $result, $all);

echo "Total items returned: ".count($result)."\n\n";
echo "First 20 items:\n";
foreach (array_slice($result, 0, 20) as $item) {
    echo str_repeat('  ', $item['depth'])."[{$item['depth']}] {$item['nameEn']} ({$item['slug']})\n";
}
