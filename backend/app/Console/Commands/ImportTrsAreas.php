<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TrsArea;
use App\Models\GramaNiladhari;
use Illuminate\Support\Facades\DB;

class ImportTrsAreas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:trs-areas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import TRS Areas from JSON and map to districts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $jsonFile = base_path('../trs_areas.json');
        if (!file_exists($jsonFile)) {
            $this->error("JSON file not found at: {$jsonFile}");
            return;
        }

        $data = json_decode(file_get_contents($jsonFile), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error("Invalid JSON data");
            return;
        }

        DB::beginTransaction();
        try {
            TrsArea::truncate();

            $total = count($data);
            $bar = $this->output->createProgressBar($total);
            
            $unmappedCount = 0;

            foreach ($data as $item) {
                $enName = $item['name_en'] ?? '';
                
                // Extract prefix (e.g., "Ambalangoda")
                $prefix = str_replace(
                    [
                        '- Regional Management Office Area',
                        'Regional Management Office Area',
                        '- Local Exchange Area',
                        'Local Exchange Area',
                        '-'
                    ], 
                    '', 
                    $enName
                );
                $prefix = trim($prefix);
                
                $gndName = null;
                
                if (!empty($prefix)) {
                    // Match prefix with name_en
                    $gndName = GramaNiladhari::where('name_en', 'like', "%{$prefix}%")->value('name_en');
                }
                
                if (!$gndName) {
                    $unmappedCount++;
                }

                TrsArea::create([
                    'code' => $item['code'],
                    'location' => $item['location'],
                    'full_location_name' => $item['full_location_name'],
                    'location_type' => $item['location_type'],
                    'name_si' => $item['name_si'],
                    'name_en' => $item['name_en'],
                    'name_ta' => $item['name_ta'],
                    'district' => $gndName // We are storing the matched name_en here so we don't have to alter the schema
                ]);

                $bar->advance();
            }

            DB::commit();
            $bar->finish();
            $this->info("\nTRS areas imported successfully!");
            if ($unmappedCount > 0) {
                $this->warn("Warning: {$unmappedCount} areas could not be mapped to a district.");
            }
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("\nError importing TRS areas: " . $e->getMessage());
        }
    }
}
