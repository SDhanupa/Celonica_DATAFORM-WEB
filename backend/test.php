<?php 
require __DIR__.'/vendor/autoload.php'; 
$app = require_once __DIR__.'/bootstrap/app.php'; 
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap(); 
$q = new \App\GraphQL\Queries\CategorySubmissionQueries(); 
echo $q->approved(null, ['category_id' => 1353, 'gn_code' => 'RATPA'])->count();
