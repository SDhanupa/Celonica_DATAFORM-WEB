<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UpdateGramaNiladharis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-grama-niladharis';

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
        $jsonPath = base_path('../grama_niladharis_update.json');
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

        $this->info('Updating ' . count($data) . ' grama niladharis...');
        $bar = $this->output->createProgressBar(count($data));
        $bar->start();

        foreach ($data as $row) {
            \Illuminate\Support\Facades\DB::table('grama_niladharis')
                ->where('id', $row['id'])
                ->update([
                    'pro_en' => $row['pro_en'],
                    'pro_si' => $row['pro_si'],
                    'pro_ta' => $row['pro_ta'],
                    'dis_en' => $row['dis_en'],
                    'dis_si' => $row['dis_si'],
                    'dis_ta' => $row['dis_ta'],
                    'ds_en' => $row['ds_en'],
                    'ds_si' => $row['ds_si'],
                    'ds_ta' => $row['ds_ta'],
                ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Update completed successfully!');
    }
}
