<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GnDivisionHousingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvFile = base_path('../GN_Division_Housing.csv');

        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at: {$csvFile}");
            return;
        }

        $file = fopen($csvFile, 'r');
        $isHeader = true;

        $batchSize = 500;
        $batch = [];

        while (($row = fgetcsv($file)) !== false) {
            if ($isHeader) {
                $isHeader = false;
                continue;
            }

            // Map row to database columns
            $batch[] = [
                'gn_division' => $row[0] ?? null,
                'ds_division' => $row[1] ?? null,
                'district' => $row[2] ?? null,
                'province' => $row[3] ?? null,
                'total_housing_units' => is_numeric($row[4]) ? (int)$row[4] : null,
                'y_2011' => is_numeric($row[5]) ? (int)$row[5] : null,
                'y_2010' => is_numeric($row[6]) ? (int)$row[6] : null,
                'y_2009' => is_numeric($row[7]) ? (int)$row[7] : null,
                'y_2008' => is_numeric($row[8]) ? (int)$row[8] : null,
                'y_2007' => is_numeric($row[9]) ? (int)$row[9] : null,
                'y_2006' => is_numeric($row[10]) ? (int)$row[10] : null,
                'y_2005' => is_numeric($row[11]) ? (int)$row[11] : null,
                'y_2000_2004' => is_numeric($row[12]) ? (int)$row[12] : null,
                'y_1995_1999' => is_numeric($row[13]) ? (int)$row[13] : null,
                'y_1990_1994' => is_numeric($row[14]) ? (int)$row[14] : null,
                'y_1980_1989' => is_numeric($row[15]) ? (int)$row[15] : null,
                'before_80' => is_numeric($row[16]) ? (int)$row[16] : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($batch) >= $batchSize) {
                \App\Models\GnDivisionHousing::insert($batch);
                $batch = [];
            }
        }

        if (count($batch) > 0) {
            \App\Models\GnDivisionHousing::insert($batch);
        }

        fclose($file);
        $this->command->info('Successfully seeded GN Division Housing data from CSV.');
    }
}
