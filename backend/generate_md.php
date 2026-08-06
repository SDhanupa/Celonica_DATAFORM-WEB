<?php
$data = json_decode(file_get_contents('storage/app/locations.json'), true);
$md = "# Category Hierarchy\n\n";

// Sort the data by number length to ensure order
usort($data, function($a, $b) {
    return strnatcmp((string)$a['Number'], (string)$b['Number']);
});

foreach($data as $d) {
    $numStr = (string)$d['Number'];
    if (empty($numStr) || $numStr === '1') continue;

    $depth = substr_count($numStr, '.');
    $name = !empty($d['Name en']) ? $d['Name en'] : $d['Name '];

    if ($depth == 1) {
        $md .= "## {$numStr} - {$name}\n\n";
    } else {
        // All other levels are just subcategories, no extra indentation
        $md .= "- {$numStr}: {$name}\n";
    }
}

// Attempt to write to D: drive
@file_put_contents('D:\category_hierarchy.md', $md);
// Write to project root
file_put_contents('../category_hierarchy.md', $md);
echo "Hierarchy Markdown generated with flat subcategories (total " . count($data) . " records).\n";
