<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class PoliceDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataPath = database_path('data');

        // 1. Police Divisions
        $divisions = json_decode(File::get("$dataPath/police_divisions.json"), true);
        if ($divisions) {
            foreach (array_chunk($divisions, 1000) as $chunk) {
                DB::table('police_divisions')->insert($chunk);
            }
        }

        // 2. Police Contacts
        $contacts = json_decode(File::get("$dataPath/police_station_contacts.json"), true);
        if ($contacts) {
            foreach (array_chunk($contacts, 1000) as $chunk) {
                DB::table('police_station_contacts')->insert($chunk);
            }
        }

        // 3. Sinhala Police Stations
        $sinhala = json_decode(File::get("$dataPath/sinhala_police_stations.json"), true);
        if ($sinhala) {
            foreach (array_chunk($sinhala, 1000) as $chunk) {
                DB::table('sinhala_police_stations')->insert($chunk);
            }
        }

        // 4. GND Police Mappings
        $mappings = json_decode(File::get("$dataPath/gnd_police_mappings.json"), true);
        if ($mappings) {
            foreach (array_chunk($mappings, 1000) as $chunk) {
                DB::table('gnd_police_mappings')->insert($chunk);
            }
        }
    }
}
