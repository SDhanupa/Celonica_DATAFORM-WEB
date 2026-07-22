<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\GramaNiladhari;
use App\Models\HousingRoofType;

$jsonFile = __DIR__ . '/roof_data.json';
if (!file_exists($jsonFile)) {
    die("Error: roof_data.json not found.\n");
}

$data = json_decode(file_get_contents($jsonFile), true);
if (!$data) {
    die("Error: Invalid JSON format.\n");
}

$total = count($data);
echo "Starting to import $total records...\n";

// Map GN logic just like the others
$allGns = GramaNiladhari::all();

function normalizeName($name) {
    // Strip prefixes like "123 - " or "123A -"
    $name = preg_replace('/^[\d\w]+\s*-\s*/', '', $name);
    return strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
}

$gnMap = [];
foreach ($allGns as $gn) {
    if (!empty($gn->name_en)) {
        $key = normalizeName($gn->name_en);
        if (!isset($gnMap[$key])) {
            $gnMap[$key] = [];
        }
        $gnMap[$key][] = $gn;
    }
}

$count = 0;
$matchedCount = 0;

foreach ($data as $row) {
    $gnName = $row['GN Division'] ?? '';
    if (empty($gnName)) {
        $count++;
        continue;
    }

    $normName = normalizeName($gnName);
    $bestGnId = null;

    if (isset($gnMap[$normName])) {
        $matches = $gnMap[$normName];
        if (count($matches) === 1) {
            $bestGnId = $matches[0]->id;
        } else {
            $dsName = normalizeName($row['DS Division'] ?? '');
            $distName = normalizeName($row['District'] ?? '');
            
            foreach ($matches as $match) {
                $matchDs = normalizeName($match->ds_en ?? '');
                $matchDis = normalizeName($match->dis_en ?? '');
                if ($matchDs === $dsName || $matchDis === $distName) {
                    $bestGnId = $match->id;
                    break;
                }
            }
            if (!$bestGnId) {
                $bestGnId = $matches[0]->id;
            }
        }
    }

    if ($bestGnId) {
        $matchedCount++;
    }

    HousingRoofType::updateOrCreate(
        [
            'grama_niladhari_id' => $bestGnId,
            'gn_name' => $gnName,
        ],
        [
            'total_housing_units' => $row['Total Housing units'],
            'tile' => $row['Tile'],
            'asbestos' => $row['Asbestos'],
            'concrete' => $row['Concrete'],
            'zink_aluminium_sheet' => $row['Zink Aluminium sheet'],
            'metal_sheet' => $row['Metal sheet'],
            'cadjan_palmyrah_straw' => $row['Cadjan/Palmyrah/Straw'],
            'other' => $row['Other']
        ]
    );

    $count++;
    if ($count % 500 === 0) {
        echo "Processed $count / $total records... (Matched: $matchedCount)\n";
    }
}

echo "Import complete! Inserted $count records. Matched $matchedCount GNs.\n";
