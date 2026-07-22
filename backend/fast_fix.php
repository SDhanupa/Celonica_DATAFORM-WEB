<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = [
    'housing_ownership_statuses',
    'housing_wall_types',
    'housing_unit_types',
    'toilet_facilities',
    'drinking_water_sources',
    'solid_waste_disposals'
];

foreach ($tables as $table) {
    echo "Updating $table...\n";
    $affected = DB::update("
        UPDATE $table t
        SET gn_id = g.id
        FROM grama_niladharis g
        WHERE t.gn_id IS NULL
          AND t.district = g.dis_en
          AND replace(t.ds_division, 'h', '') = replace(g.ds_en, 'h', '')
          AND replace(t.gn_name, ' ', '') = replace(g.name_en, ' ', '')
    ");
    echo "Fixed $affected records in $table.\n";
}
