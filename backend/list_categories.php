<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Show all top-level categories with child count
$categories = DB::table('categories')->whereNull('parent_id')->select('id', 'name_en', 'slug')->get();

foreach ($categories as $c) {
    $childCount = DB::table('categories')->where('parent_id', $c->id)->count();
    echo $c->id . " | " . $c->name_en . " | slug=" . $c->slug . " | children=" . $childCount . "\n";
}

echo "\n--- Total top-level categories: " . count($categories) . " ---\n";

// Also show what columns exist
$cols = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' AND table_schema = 'public' ORDER BY ordinal_position");
echo "\nColumns: ";
foreach ($cols as $col) {
    echo $col->column_name . ", ";
}
echo "\n";
