<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportGramaNiladharis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:gn-divisions';
    protected $description = 'Import GN divisions from CSV';

    public function handle()
    {
        $csvPath = storage_path('app/gn_divisions.csv');
        
        if (!file_exists($csvPath)) {
            $this->error("CSV file not found at: {$csvPath}");
            return 1;
        }

        $this->info("Importing GN Divisions from {$csvPath}...");

        $file = fopen($csvPath, 'r');
        $header = fgetcsv($file); // skip header

        $count = 0;
        
        $this->output->progressStart(14000); // approx lines

        while (($row = fgetcsv($file)) !== false) {
            if (empty($row[16])) continue; // Skip if code is empty

            try {
                \App\Models\GramaNiladhari::updateOrCreate(
                    ['code' => $row[16]], // match on code
                    [
                        'province_code' => $row[1],
                        'PCCODE' => $row[2],
                        'pro_en' => $row[3],
                        'pro_si' => $row[4],
                        'pro_ta' => $row[5],
                        'district_code' => $row[6],
                        'DCCODE' => $row[7],
                        'dis_en' => $row[8],
                        'dis_si' => $row[9],
                        'dis_ta' => $row[10],
                        'divisional_secretariat_code' => $row[11],
                        'DSCCODE' => $row[12],
                        'ds_en' => $row[13],
                        'ds_si' => $row[14],
                        'ds_ta' => $row[15],
                        'CCODE' => $row[17],
                        'name_si' => $row[18],
                        'name_en' => $row[19],
                        'name_ta' => $row[20],
                    ]
                );
                $count++;
            } catch (\Exception $e) {
                // Ignore constraint violations for missing districts/provinces
            }
            
            if ($count % 100 === 0) {
                $this->output->progressAdvance(100);
            }
        }

        $this->output->progressFinish();
        fclose($file);

        $this->info("Successfully imported {$count} GN divisions!");
        return 0;
    }
}
