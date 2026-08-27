<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check structure under location-1-4
$root = \App\Models\Category::where('slug','location-1-4')->first();
if (!$root) { echo "NOT FOUND: location-1-4\n"; exit; }
echo "Root: {$root->slug} | {$root->name_en} (id:{$root->id})\n";
echo "Direct children: ".\App\Models\Category::where('parent_id',$root->id)->count()."\n";

\App\Models\Category::where('parent_id',$root->id)->each(function($c){
    echo "  - {$c->slug} | {$c->name_en} (id:{$c->id})\n";
    $subs = \App\Models\Category::where('parent_id',$c->id)->count();
    echo "    children: {$subs}\n";
    \App\Models\Category::where('parent_id',$c->id)->each(function($s){
        echo "    - {$s->slug} | {$s->name_en} (id:{$s->id})\n";
    });
});

echo "\nTotal descendants (recursive):\n";
function countAll($id) {
    $kids = \App\Models\Category::where('parent_id',$id)->get();
    $total = count($kids);
    foreach ($kids as $k) $total += countAll($k->id);
    return $total;
}
echo "  Under location-1-4: ".countAll($root->id)."\n";
