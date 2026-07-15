<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PSrilanka;
use Illuminate\Support\Facades\File;

class PSrilankaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PSrilanka::truncate();
        
        $json = File::get(base_path('../srilanka_data.json'));
        $data = json_decode($json, true);
        
        foreach ($data as $item) {
            PSrilanka::create($item);
        }
    }
}
