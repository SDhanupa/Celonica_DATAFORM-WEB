<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function getSubcats($id, &$all = []) {
    $children = DB::table('categories')->where('parent_id', $id)->get();
    foreach($children as $c) {
        $all[] = $c;
        getSubcats($c->id, $all);
    }
}
$subs = [];
getSubcats(230, $subs); // 230 is Space
echo json_encode($subs);
