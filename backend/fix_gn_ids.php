<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$records = DB::table('category_data_sapdsgv_village_boundaries')->get();
$fixed = 0;
foreach ($records as $record) {
    if (!is_numeric($record->gn_id)) {
        $gn = DB::table('grama_niladharis')->where('CCODE', $record->gn_id)->orWhere('code', $record->gn_id)->first();
        if ($gn) {
            DB::table('category_data_sapdsgv_village_boundaries')->where('id', $record->id)->update(['gn_id' => $gn->id]);
            $fixed++;
        }
    }
}
echo 'Fixed ' . $fixed . ' records';
