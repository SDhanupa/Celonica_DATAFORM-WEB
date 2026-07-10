<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Police;

class PoliceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/police.json');
        if (!file_exists($jsonPath)) {
            $this->command->warn("Seeder file not found: {$jsonPath}");
            return;
        }

        $json = file_get_contents($jsonPath);
        $data = json_decode($json, true);

        Police::truncate();

        $chunks = array_chunk($data, 500);

        foreach ($chunks as $chunk) {
            $insertData = [];
            foreach ($chunk as $row) {
                $insertData[] = [
                    'ccode' => $row['ccode'] ?? '',
                    'gnd_id' => $row['gnd_id'] ?? '',
                    'name' => $row['name'] ?? '',
                    'province_id' => $row['province_id'] ?? '',
                    'district_id' => $row['district_id'] ?? '',
                    'dsd_id' => $row['dsd_id'] ?? '',
                    'pd_id' => $row['pd_id'] ?? '',
                    'gnd_num' => $row['gnd_num'] ?? '',
                    'lat' => $row['lat'] ?? '',
                    'lng' => $row['lng'] ?? '',
                    'ps_id' => $row['ps_id'] ?? '',
                    'ps_name' => $row['ps_name'] ?? '',
                    'ps_name_si' => $row['ps_name_si'] ?? '',
                    'ps_name_ta' => $row['ps_name_ta'] ?? '',
                    'distance_to_the_police_station' => $row['distance_to_the_police_station'] ?? '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            Police::insert($insertData);
        }
        $this->command->info("Inserted " . count($data) . " Police records.");
    }
}
