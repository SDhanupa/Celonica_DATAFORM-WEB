<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$gampaha = \App\Models\PDistrict::where('admin2NameEn', 'like', '%Gampaha%')->first();
if ($gampaha) {
    echo "Gampaha District Code (admin2Pcode): " . $gampaha->admin2Pcode . "\n";
    
    // The relationship in PDistrict is: hasMany(GramaNiladhari::class, 'district_code', 'admin2Pcode')
    // Wait, in PDistrict.php it is:
    // return $this->hasMany(GramaNiladhari::class, 'district_code', 'admin2Pcode');
    // Let's check how many GNs exist with this district_code
    
    $gnCount = \App\Models\GramaNiladhari::where('district_code', $gampaha->admin2Pcode)->count();
    echo "GNs for Gampaha using district_code: $gnCount\n";
    
    // Let's check how many GNs actually have "Gampaha" as DCCODE or something?
    $gnSample = \App\Models\GramaNiladhari::where('district_code', $gampaha->admin2Pcode)->first();
    if ($gnSample) {
        echo "Sample GN: " . $gnSample->nameEn . ", DS: " . $gnSample->dsEn . "\n";
    }
} else {
    echo "Gampaha not found in PDistrict\n";
}

$trinco = \App\Models\PDistrict::where('admin2NameEn', 'like', '%Trincomalee%')->first();
if ($trinco) {
    echo "\nTrincomalee District Code: " . $trinco->admin2Pcode . "\n";
    $gnCount = \App\Models\GramaNiladhari::where('district_code', $trinco->admin2Pcode)->count();
    echo "GNs for Trinco: $gnCount\n";
    
    // Let's find GNs with dsEn like Homagama
    $homagama = \App\Models\GramaNiladhari::where('district_code', $trinco->admin2Pcode)
                    ->where('dsEn', 'like', '%Homagama%')
                    ->count();
    echo "GNs in Trinco with DS Homagama: $homagama\n";
}
