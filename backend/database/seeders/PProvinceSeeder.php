<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PProvince;
use Illuminate\Support\Facades\File;

class PProvinceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PProvince::truncate();
        
        $json = File::get(base_path('../province_data.json'));
        $data = json_decode($json, true);
        
        foreach ($data as $item) {
            PProvince::create($item);
        }
    }
}
