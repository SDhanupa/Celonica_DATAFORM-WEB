<?php

use App\Models\Category;

$categories = Category::whereNotNull('code')->get();
$count = 0;
foreach ($categories as $cat) {
    $newCode = str_replace(['[', ']'], '', $cat->code);
    if ($cat->code !== $newCode) {
        $cat->code = $newCode;
        $cat->save();
        $count++;
    }
}
echo "Removed brackets from $count categories in DB.\n";
