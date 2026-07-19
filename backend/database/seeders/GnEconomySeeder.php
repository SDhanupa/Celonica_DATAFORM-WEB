<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class GnEconomySeeder extends Seeder
{
    public function run(): void
    {
        $csvFile = base_path('../GN_Economy.csv');

        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at: {$csvFile}");
            return;
        }

        $file = fopen($csvFile, 'r');
        $isHeader = true;
        $batchSize = 500;
        $batch = [];
        $now = now();

        while (($row = fgetcsv($file)) !== false) {
            if ($isHeader) {
                $isHeader = false;
                continue;
            }

            $batch[] = [
                'name'                    => $row[0] ?: null,
                'gn_number'               => $row[1] ?: null,
                'total'                   => is_numeric($row[2]) ? (int)$row[2] : null,
                'employed'                => is_numeric($row[3]) ? (int)$row[3] : null,
                'unemployed'              => is_numeric($row[4]) ? (int)$row[4] : null,
                'economically_not_active' => is_numeric($row[5]) ? (int)$row[5] : null,
                'created_at'              => $now,
                'updated_at'              => $now,
            ];

            if (count($batch) >= $batchSize) {
                \App\Models\GnEconomy::insert($batch);
                $batch = [];
            }
        }

        if (count($batch) > 0) {
            \App\Models\GnEconomy::insert($batch);
        }

        fclose($file);
        $this->command->info('GN Economy data seeded successfully (' . 14375 . ' rows).');
    }
}
