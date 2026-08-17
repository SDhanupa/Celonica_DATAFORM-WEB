<?php 
require __DIR__.'/vendor/autoload.php'; 
$app = require_once __DIR__.'/bootstrap/app.php'; 
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap(); 
$q = new \App\GraphQL\Queries\CategorySubmissionQueries(); 
echo json_encode($q->approved(null, ['category_id' => 1353, 'gn_code' => 'NVSPL'])->toArray(), JSON_PRETTY_PRINT);
