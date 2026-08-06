<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

// Fetch all categories exactly as they are in the database, ordered by ID
$categories = Category::orderBy('id')->get()->toArray();

$seederPath = database_path('seeders/CategorySeeder.php');

$php = "<?php\n\nnamespace Database\\Seeders;\n\nuse Illuminate\\Database\\Seeder;\nuse Illuminate\\Support\\Facades\\DB;\nuse App\\Models\\Category;\n\nclass CategorySeeder extends Seeder\n{\n    public function run()\n    {\n";
$php .= "        \$categories = [\n";

foreach ($categories as $cat) {
    $id = var_export($cat['id'], true);
    $slug = var_export($cat['slug'], true);
    $name_en = var_export($cat['name_en'], true);
    $name_si = var_export($cat['name_si'], true);
    $name_ta = var_export($cat['name_ta'], true);
    $description_en = var_export($cat['description_en'], true);
    $description_si = var_export($cat['description_si'], true);
    $description_ta = var_export($cat['description_ta'], true);
    $parent_id = var_export($cat['parent_id'], true);
    $sort_order = var_export($cat['sort_order'], true);
    
    // Created at / updated at
    $now = var_export(now()->toDateTimeString(), true);

    $php .= "            [\n";
    $php .= "                'id' => {$id},\n";
    $php .= "                'slug' => {$slug},\n";
    $php .= "                'name_en' => {$name_en},\n";
    $php .= "                'name_si' => {$name_si},\n";
    $php .= "                'name_ta' => {$name_ta},\n";
    $php .= "                'description_en' => {$description_en},\n";
    $php .= "                'description_si' => {$description_si},\n";
    $php .= "                'description_ta' => {$description_ta},\n";
    $php .= "                'parent_id' => {$parent_id},\n";
    $php .= "                'sort_order' => {$sort_order},\n";
    $php .= "                'created_at' => {$now},\n";
    $php .= "                'updated_at' => {$now},\n";
    $php .= "            ],\n";
}

$php .= "        ];\n\n";

// Use bulk insert in chunks for blazing fast performance and low memory
$php .= "        DB::disableQueryLog();\n";
$php .= "        foreach (array_chunk(\$categories, 500) as \$chunk) {\n";
$php .= "            Category::insert(\$chunk);\n";
$php .= "        }\n";

// Reset auto-increment sequence for PostgreSQL since we are inserting explicit IDs
$php .= "        \$maxId = Category::max('id') + 1;\n";
$php .= "        DB::statement(\"ALTER SEQUENCE categories_id_seq RESTART WITH {\$maxId}\");\n";

$php .= "    }\n}\n";

file_put_contents($seederPath, $php);
echo "Seeder generated successfully at $seederPath with " . count($categories) . " records.\n";
