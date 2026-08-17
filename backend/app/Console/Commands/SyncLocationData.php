<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class SyncLocationData extends Command
{
    protected $signature = 'app:sync-location-data';
    protected $description = 'One-time script to permanently match and save GN/Location strings in category_data tables';

    public function handle()
    {
        $this->info('Starting sync...');

        // 1. Fetch GN map
        $gns = DB::table('grama_niladharis')->get();
        $this->info('Loaded ' . $gns->count() . ' GNs into memory.');

        // 2. Get all category_data tables
        $tables = DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'category_data_%'");
        
        foreach ($tables as $t) {
            $tableName = $t->tablename;
            $this->info("Processing $tableName...");

            // Ensure columns exist
            if (!Schema::hasColumn($tableName, 'final_province')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->string('final_province')->nullable();
                    $table->string('final_district')->nullable();
                    $table->string('final_ds')->nullable();
                    $table->string('final_gn')->nullable();
                });
            }

            // Fetch records that haven't been mapped yet
            $records = DB::table($tableName)->whereNull('final_province')->get();
            $this->info("  Found " . $records->count() . " unmapped records.");

            $updatedCount = 0;
            
            // OPTIMIZATION: Index the GNs by CCODE, code, and id for O(1) lookups!
            $gnsByCcode = $gns->keyBy('CCODE');
            $gnsByCode = $gns->keyBy('code');
            $gnsById = $gns->keyBy('id');

            foreach ($records as $record) {
                $matchedGn = null;
                if ($record->gn_id) {
                    $matchedGn = $gnsByCcode->get($record->gn_id) 
                              ?? $gnsByCode->get($record->gn_id) 
                              ?? $gnsById->get($record->gn_id);
                }

                DB::table($tableName)->where('id', $record->id)->update([
                    'final_province' => $matchedGn ? $matchedGn->pro_en : $record->raw_province,
                    'final_district' => $matchedGn ? $matchedGn->dis_en : $record->raw_district,
                    'final_ds' => $matchedGn ? $matchedGn->ds_en : $record->raw_ds,
                    'final_gn' => $matchedGn ? $matchedGn->name_en : $record->raw_gn,
                ]);
                $updatedCount++;
            }
            $this->info("  Updated $updatedCount records.");
        }

        $this->info('Sync complete!');
    }
}
