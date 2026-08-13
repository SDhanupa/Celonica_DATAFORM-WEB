<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Find the district
$district = DB::table('districts')->where('nameEn', 'ILIKE', '%Nuwara Eliya%')->first();
if (!$district) {
    echo "District not found\n";
    exit;
}
echo "District ID: " . $district->id . "\n";

// Find the DS division
$ds = DB::table('ds_divisions')->where('dsEn', 'ILIKE', '%Kothmale%')->first();
if (!$ds) {
    echo "DS not found\n";
    exit;
}
echo "DS ID: " . $ds->divisionalSecretariatCode . "\n";

// Find the GN division
$gn = DB::table('grama_niladharis')->where('nameEn', 'ILIKE', '%Mawela Kanda%')->first();
if (!$gn) {
    echo "GN not found\n";
    exit;
}
echo "GN ID: " . $gn->id . " CCODE: " . $gn->CCODE . "\n";

// Let's check solid waste disposal data. What is the table?
// Let's just search all tables for "solid" or check schema
$tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
$target_tables = [];
foreach ($tables as $t) {
    if (stripos($t->table_name, 'waste') !== false || stripos($t->table_name, 'solid') !== false || stripos($t->table_name, 'demographic') !== false || stripos($t->table_name, 'housing') !== false) {
        $target_tables[] = $t->table_name;
    }
}
echo "Possible tables:\n";
print_r($target_tables);

// If there's a specific table for survey data, we can query it.
// Let's dump all records related to this GN from these tables.
foreach ($target_tables as $table) {
    try {
        $cols = DB::getSchemaBuilder()->getColumnListing($table);
        if (in_array('gn_id', $cols)) {
            $data = DB::table($table)->where('gn_id', $gn->id)->get();
            echo "Data in $table (gn_id):\n";
            print_r($data->toArray());
        } elseif (in_array('CCODE', $cols) || in_array('ccode', $cols)) {
            $ccode_col = in_array('CCODE', $cols) ? 'CCODE' : 'ccode';
            $data = DB::table($table)->where($ccode_col, $gn->CCODE)->get();
            echo "Data in $table ($ccode_col):\n";
            print_r($data->toArray());
        } elseif (in_array('gn_division_id', $cols)) {
            $data = DB::table($table)->where('gn_division_id', $gn->id)->get();
            echo "Data in $table (gn_division_id):\n";
            print_r($data->toArray());
        }
    } catch (\Exception $e) {
        // ignore
    }
}
