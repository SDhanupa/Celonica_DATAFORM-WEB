<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GramaNiladhariSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/gm_divisions.json');
        if (!file_exists($jsonPath)) {
            $this->command->warn("Seeder file not found: {$jsonPath}");
            return;
        }

        $json = file_get_contents($jsonPath);
        $data = json_decode($json, true);
        
        \App\Models\GramaNiladhari::truncate();
        
        $chunks = array_chunk($data, 500);

        foreach ($chunks as $chunk) {
            $insertData = [];
            foreach ($chunk as $row) {
                $insertData[] = [
                    'province_code' => $row['province_code'] ?? '',
                    'PCCODE' => $row['PCCODE'] ?? '',
                    'district_code' => $row['district_code'] ?? '',
                    'DCCODE' => $row['DCCODE'] ?? '',
                    'divisional_secretariat_code' => $row['divisional_secretariat_code'] ?? '',
                    'DSCCODE' => $row['DSCCODE'] ?? '',
                    'code' => $row['code'] ?? '',
                    'CCODE' => $row['CCODE'] ?? '',
                    'name_si' => $row['name_si'] ?? '',
                    'name_en' => $row['name_en'] ?? '',
                    'name_ta' => $row['name_ta'] ?? '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            \App\Models\GramaNiladhari::insert($insertData);
        }
        $this->command->info("Inserted " . count($data) . " GM divisions.");
    }
}
