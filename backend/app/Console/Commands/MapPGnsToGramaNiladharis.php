<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\GramaNiladhari;
use App\Models\PGn;

class MapPGnsToGramaNiladharis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:map-p-gns-to-grama-niladharis';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Maps p_gns table foreign keys to grama_niladharis based on english name';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking if CCODE exists in p_gns...');
        if (!\Illuminate\Support\Facades\Schema::hasColumn('p_gns', 'CCODE')) {
            \Illuminate\Support\Facades\Schema::table('p_gns', function ($table) {
                $table->string('CCODE')->nullable();
            });
            $this->info('Added CCODE column to p_gns table.');
        }

        $this->info('Starting mapping...');
        $gns = GramaNiladhari::whereNotNull('name_en')->get();
        $count = 0;
        foreach($gns as $gn) {
            $updated = PGn::where('gn_name', $gn->name_en)
                          ->update([
                              'grama_niladhari_id' => $gn->id,
                              'CCODE' => $gn->CCODE
                          ]);
            $count += $updated;
        }
        $this->info("Updated {$count} records in p_gns.");
    }
}
