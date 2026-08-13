<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'category_data_%'");
$totalTablesCleared = 0;
$totalRecordsDeleted = 0;

echo "Warning: This will delete ALL submitted survey data proposals from all category tables.\n";
echo "It will NOT delete your Categories, Users, or Grama Niladhari data.\n";
echo "Clearing data...\n\n";

foreach ($tables as $t) {
    $tableName = $t->tablename;
    $count = DB::table($tableName)->count();
    
    if ($count > 0) {
        DB::table($tableName)->truncate();
        echo "Table: $tableName - Cleared $count records.\n";
        $totalTablesCleared++;
        $totalRecordsDeleted += $count;
    }
}

echo "\nCompleted! Cleared $totalRecordsDeleted test records across $totalTablesCleared tables.\n";
