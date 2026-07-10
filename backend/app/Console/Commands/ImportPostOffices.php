<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportPostOffices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-post-offices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $jsonPath = base_path('../post_offices.json');
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

        $this->info('Truncating post_offices table...');
        \App\Models\PostOffice::truncate();

        $this->info('Importing ' . count($data) . ' post offices...');
        
        $bar = $this->output->createProgressBar(count($data));
        $bar->start();

        foreach ($data as $row) {
            \App\Models\PostOffice::create([
                'country_code' => $row['country_code'],
                'province' => $row['province'],
                'province_code' => $row['province_code'],
                'district' => $row['district'],
                'disid' => $row['disid'],
                'ds_aga' => $row['ds_aga'],
                'ds_code' => $row['ds_code'],
                'postal_code' => $row['postal_code'],
                'place_name_english' => $row['place_name_english'],
                'sinhala' => $row['sinhala'],
                'tamil' => $row['tamil'],
                'latitude' => $row['latitude'] !== null ? (float) $row['latitude'] : null,
                'longitude' => $row['longitude'] !== null ? (float) $row['longitude'] : null,
                'accuracy' => (string) $row['accuracy'],
            ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Import completed successfully!');
    }
}
