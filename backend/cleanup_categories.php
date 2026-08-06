<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// IDs to DELETE (the duplicate location-1-x series and "Tree")
$deleteIds = [31720, 31945, 32021, 32063, 34514, 34641, 34655, 34663, 34750, 34759];

echo "Deleting duplicate categories and their children...\n";

// Delete children first (grandchildren of duplicates too if any)
$totalChildrenDeleted = 0;
foreach ($deleteIds as $id) {
    // Get child ids first
    $children = DB::table('categories')->where('parent_id', $id)->pluck('id');
    // Delete grandchildren
    if ($children->count() > 0) {
        $gc = DB::table('categories')->whereIn('parent_id', $children->toArray())->delete();
        if ($gc > 0) echo "  Deleted $gc grandchildren of category $id\n";
    }
    $childrenDeleted = DB::table('categories')->where('parent_id', $id)->delete();
    $totalChildrenDeleted += $childrenDeleted;
    echo "  Deleted $childrenDeleted children of category $id\n";
}

// Delete the top-level duplicates
$deleted = DB::table('categories')->whereIn('id', $deleteIds)->delete();
echo "\nDeleted $deleted duplicate top-level categories.\n";
echo "Deleted $totalChildrenDeleted sub-categories.\n";

// Verify what's left
$remaining = DB::table('categories')->whereNull('parent_id')->select('id', 'name_en', 'slug')->get();
echo "\n=== REMAINING TOP-LEVEL CATEGORIES (" . count($remaining) . ") ===\n";
foreach ($remaining as $c) {
    $children = DB::table('categories')->where('parent_id', $c->id)->count();
    echo "  id=" . $c->id . " | " . $c->name_en . " | slug=" . $c->slug . " | children=" . $children . "\n";
}

echo "\nDone!\n";
