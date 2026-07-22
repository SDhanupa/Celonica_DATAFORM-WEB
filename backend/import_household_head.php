<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\GramaNiladhari;
use App\Models\HouseholdHeadRelationship;

$jsonFile = __DIR__ . '/household_head_data.json';
if (!file_exists($jsonFile)) {
    die("Error: household_head_data.json not found.\n");
}

$data = json_decode(file_get_contents($jsonFile), true);
if (!$data) {
    die("Error: Invalid JSON format.\n");
}

$total = count($data);
echo "Starting to import $total records...\n";

$allGns = GramaNiladhari::all();

function normalizeName($name) {
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
            if (!$bestGnId) $bestGnId = $matches[0]->id;
        }
    }

    if ($bestGnId) $matchedCount++;

    HouseholdHeadRelationship::updateOrCreate(
        ['grama_niladhari_id' => $bestGnId, 'gn_name' => $gnName],
        [
            'total_population'            => $row['Total Population'] ?? 0,
            'head'                        => $row['Head'] ?? 0,
            'wife_husband'                => $row['Wife/Husband'] ?? 0,
            'son_daughter'                => $row['Son/daughter'] ?? 0,
            'son_daughter_in_law'         => $row['Son/Daughter-in-law'] ?? 0,
            'grandchild_great_grandchild' => $row['Grandchild/Great grand child'] ?? 0,
            'parent_of_head_or_spouse'    => $row['Parent of head or spouse'] ?? 0,
            'other_relative'              => $row['Other relative'] ?? 0,
            'domestic_employee'           => $row['Domestic employee'] ?? 0,
            'boarder'                     => $row['Boarder'] ?? 0,
            'non_relative'                => $row['Non relative'] ?? 0,
            'clergy'                      => $row['Clergy'] ?? 0,
            'not_stated'                  => $row['Not stated'] ?? 0,
        ]
    );

    $count++;
    if ($count % 500 === 0) {
        echo "Processed $count / $total records... (Matched: $matchedCount)\n";
    }
}

echo "Import complete! Inserted $count records. Matched $matchedCount GNs.\n";
