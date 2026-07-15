<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportPhiAreas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-phi-areas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import PHI Areas from JSON file generated from Excel';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $jsonPath = base_path('../phi_areas.json');
        if (!file_exists($jsonPath)) {
            $this->error('File not found at ' . $jsonPath);
            return;
        }

        $json = file_get_contents($jsonPath);
        $data = json_decode($json, true);

        if (!$data) {
            $this->error('Invalid JSON');
            return;
        }

        $this->info('Truncating phi_areas table...');
        \App\Models\PhiArea::truncate();

        $this->info('Importing ' . count($data) . ' PHI areas...');
        
        $bar = $this->output->createProgressBar(count($data));
        $bar->start();

        foreach ($data as $row) {
            \App\Models\PhiArea::create([
                'ccode' => $row['ccode'],
                'code' => $row['code'],
                'location' => $row['location'],
                'full_location_name' => $row['full_location_name'],
                'location_type' => $row['location_type'],
                'name_si' => $row['name_si'],
                'name_en' => $row['name_en'],
                'name_ta' => $row['name_ta'],
                'district' => $row['district'],
            ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Import completed successfully!');
    }
}
