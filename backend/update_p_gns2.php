<?php
use App\Models\GramaNiladhari;
use App\Models\PGn;

$json = file_get_contents(__DIR__ . '/gn_population_updates2.json');
$data = json_decode($json, true);

$updated = 0;
$not_found = 0;

foreach ($data as $row) {
    $gnName = $row['gn_name'];
    $district = $row['district'];
    $dsDiv = $row['ds_div'];
    
    $query = GramaNiladhari::where('name_en', $gnName);
    
    if ($district) {
        $query->where('dis_en', 'LIKE', '%' . substr($district, 0, 5) . '%');
    }
    
    $gns = $query->get();
    
    if ($gns->count() > 1 && $dsDiv) {
        $dsPrefix = substr(str_replace([' ', 'th'], ['', 't'], strtolower($dsDiv)), 0, 5);
        $matchedGn = null;
        foreach ($gns as $gn) {
            $dbDs = substr(str_replace([' ', 'th'], ['', 't'], strtolower($gn->ds_en)), 0, 5);
            if ($dsPrefix == $dbDs || str_contains(strtolower($gn->ds_en), $dsPrefix) || str_contains(strtolower($dsDiv), $dbDs)) {
                $matchedGn = $gn;
                break;
            }
        }
        $gnToUpdate = $matchedGn ?? $gns->first();
    } else {
        $gnToUpdate = $gns->first();
    }
    
    if ($gnToUpdate) {
        $pGn = PGn::where('grama_niladhari_id', $gnToUpdate->id)->first();
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
        }
    } else {
        $not_found++;
    }
}
echo "Updated $updated PGn records using smarter matching. Not found matching GN: $not_found.\n";
