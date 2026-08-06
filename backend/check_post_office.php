<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$ccode = 'RATPA';
$gn = DB::table('grama_niladharis')->where('CCODE', $ccode)->first();
echo "GN: " . $gn->name_en . " | ds_en=" . $gn->ds_en . " | dis_en=" . $gn->dis_en . "\n";
echo "DSCCODE=" . $gn->DSCCODE . " | DCCODE=" . $gn->DCCODE . "\n\n";

// Check police table columns
echo "--- Police table columns ---\n";
$cols = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'police' AND table_schema = 'public' ORDER BY ordinal_position");
foreach ($cols as $c) echo $c->column_name . "\n";

// Find police by ccode
echo "\n--- Police by ccode=RATPA ---\n";
$police = DB::table('police')->where('ccode', $ccode)->first();
if ($police) {
    foreach ((array)$police as $k => $v) echo "  $k = $v\n";
} else {
    echo "No police with ccode=RATPA\n";
    // Check how many police records exist
    echo "Total police records: " . DB::table('police')->count() . "\n";
    $sample = DB::table('police')->limit(3)->get();
    foreach ($sample as $p) echo "  ccode=" . $p->ccode . " | ps_name=" . $p->ps_name . " | gnd_id=" . $p->gnd_id . "\n";
}

// Check post_offices columns
echo "\n--- Post Offices columns ---\n";
$cols2 = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'post_offices' AND table_schema = 'public' ORDER BY ordinal_position");
foreach ($cols2 as $c) echo $c->column_name . "\n";

// Total post offices
echo "\nTotal post offices: " . DB::table('post_offices')->count() . "\n";

// Sample post offices
echo "\n--- Sample post offices ---\n";
$sample = DB::table('post_offices')->limit(5)->get();
foreach ($sample as $p) {
    $data = (array)$p;
    foreach ($data as $k => $v) echo "  $k=$v";
    echo "\n---\n";
}

// Try to find post office for this GN by district/ds
echo "\n--- Post offices for district: " . $gn->dis_en . " ---\n";
$matching = DB::table('post_offices')
    ->where('district', 'ilike', '%' . $gn->dis_en . '%')
    ->select('id', 'place_name_english', 'postal_code', 'district', 'ds_aga', 'ds_code')
    ->limit(5)->get();
foreach ($matching as $p) {
    echo "id=" . $p->id . " | " . $p->place_name_english . " | postal=" . $p->postal_code . " | ds_code=" . $p->ds_code . "\n";
}
