<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PDistrict;
use App\Models\GramaNiladhari;

class GenerateLocationData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:location-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a static JSON file containing the District -> DS -> GN hierarchy for the frontend to cache.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating static location hierarchy...');

        $districts = PDistrict::all();
        $output = [];

        foreach ($districts as $district) {
            $districtData = [
                'id' => $district->id,
                'nameEn' => $district->admin2Name_en ?? $district->name_en,
                'nameSi' => $district->admin2Name_si ?? $district->name_si,
                'nameTa' => $district->admin2Name_ta ?? $district->name_ta,
                'cities' => []
            ];

            // Get GNs for this district
            $gns = GramaNiladhari::where('dis_en', $districtData['nameEn'])->get();
            $dsMap = [];

            foreach ($gns as $gn) {
                $dsCode = $gn->divisional_secretariat_code ?? $gn->ds_en;
                if (!$dsCode) continue;

                if (!isset($dsMap[$dsCode])) {
                    $dsMap[$dsCode] = [
                        'dsCode' => $dsCode,
                        'dsEn' => $gn->ds_en ?? $dsCode,
                        'dsSi' => $gn->ds_si,
                        'dsTa' => $gn->ds_ta,
                        'gns' => []
                    ];
                }

                $dsMap[$dsCode]['gns'][] = [
                    'id' => $gn->id,
                    'ccode' => $gn->CCODE,
                    'nameEn' => $gn->name_en,
                    'nameSi' => $gn->name_si,
                    'nameTa' => $gn->name_ta
                ];
            }

            $districtData['cities'] = array_values($dsMap);
            $output[] = $districtData;
        }

        // Save to frontend public directory
        $frontendPath = base_path('../frontend/public/data');
        if (!file_exists($frontendPath)) {
            mkdir($frontendPath, 0777, true);
        }
        
        $filePath = $frontendPath . '/locations.json';
        file_put_contents($filePath, json_encode($output));

        $this->info('Successfully generated locations.json at ' . realpath($filePath));
        $this->info('File size: ' . round(filesize($filePath) / 1024, 2) . ' KB');
    }
}
