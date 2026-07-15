<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PDistrict;
use Illuminate\Support\Facades\File;

class PDistrictSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PDistrict::truncate();
        
        $json = File::get(base_path('../district_data.json'));
        $data = json_decode($json, true);
        
        foreach ($data as $item) {
            PDistrict::create($item);
        }
    }
}
