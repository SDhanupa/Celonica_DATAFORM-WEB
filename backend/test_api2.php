<?php 
require __DIR__."/vendor/autoload.php"; 
$app = require_once __DIR__."/bootstrap/app.php"; 
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class); 
$kernel->bootstrap(); 
$req = Illuminate\Http\Request::create("/api/search-category-data/bp-buildings-for-production-and-service-delivery", "GET", ["query" => "Neelly", "province" => "Northern Province", "district" => "Vavuniya", "ds" => "Vavuniya South", "gn" => "Pudubulankulama"]); 
$res = app()->handle($req); 
$content = $res->getContent();
if ($res->getStatusCode() !== 200) {
    echo "Error: HTTP " . $res->getStatusCode() . "\n";
    if (strpos($content, "<html") !== false) {
       echo "Returned HTML error. Exiting.\n";
    } else {
       echo $content;
    }
} else {
    echo $content;
}
