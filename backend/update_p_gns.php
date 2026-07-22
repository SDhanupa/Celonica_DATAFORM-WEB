<?php
use App\Models\GramaNiladhari;
use App\Models\PGn;

$json = file_get_contents(__DIR__ . '/gn_population_updates.json');
$data = json_decode($json, true);

$updated = 0;
$not_found = 0;

foreach ($data as $row) {
    $gnName = $row['gn_name'];
    
    // Find grama_niladharis record by name_en
    $gn = GramaNiladhari::where('name_en', $gnName)->first();
    if ($gn) {
        $pGn = PGn::where('grama_niladhari_id', $gn->id)->first();
        if ($pGn) {
            $pGn->population_both = $row['population_both'];
            $pGn->population_male = $row['population_male'];
            $pGn->population_female = $row['population_female'];
            $pGn->age_0_14 = $row['age_0_14'];
            $pGn->age_15_59 = $row['age_15_59'];
            $pGn->age_60_64 = $row['age_60_64'];
            $pGn->age_65_above = $row['age_65_above'];
            $pGn->save();
            $updated++;
        } else {
            // create if doesn't exist?
            PGn::create([
                'gn_name' => $gnName,
                'grama_niladhari_id' => $gn->id,
                'population_both' => $row['population_both'],
                'population_male' => $row['population_male'],
                'population_female' => $row['population_female'],
                'age_0_14' => $row['age_0_14'],
                'age_15_59' => $row['age_15_59'],
                'age_60_64' => $row['age_60_64'],
                'age_65_above' => $row['age_65_above']
            ]);
            $updated++;
        }
    } else {
        $not_found++;
    }
}
echo "Updated $updated PGn records. Not found matching GN: $not_found.\n";
