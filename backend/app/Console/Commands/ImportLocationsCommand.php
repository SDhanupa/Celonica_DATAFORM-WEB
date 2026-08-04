<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use Illuminate\Support\Str;

class ImportLocationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-locations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import locations from JSON to Categories table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $path = storage_path('app/locations.json');
        if (!file_exists($path)) {
            $this->error("File locations.json not found in storage/app.");
            return;
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        if (!$data) {
            $this->error("Invalid JSON data.");
            return;
        }

        // Sort data by length of "Number" (treated as string)
        usort($data, function($a, $b) {
            $lenA = strlen((string)($a['Number'] ?? ''));
            $lenB = strlen((string)($b['Number'] ?? ''));
            return $lenA <=> $lenB;
        });

        // Store mappings from Number to DB ID
        $numberToId = [];

        $this->info("Starting import of " . count($data) . " locations...");
        $bar = $this->output->createProgressBar(count($data));

        $sortOrder = 0;

        foreach ($data as $item) {
            $number = trim((string)($item['Number'] ?? ''));
            if (empty($number) || $number === '1') {
                $bar->advance();
                continue;
            }

            // Figure out parent number
            $parentNumber = null;
            if (strpos($number, '.') !== false) {
                $parts = explode('.', $number);
                array_pop($parts);
                $parentNumber = implode('.', $parts);
            }

            $parentId = null;
            if ($parentNumber && isset($numberToId[$parentNumber])) {
                $parentId = $numberToId[$parentNumber];
            }

            $nameEn = trim($item['Name en'] ?? '');
            $nameSi = trim($item['Name '] ?? '');
            $nameTa = trim($item['Name ta'] ?? '');
            
            if (empty($nameEn)) {
                $nameEn = 'Location ' . $number;
            }
            if (empty($nameSi)) {
                $nameSi = $nameEn;
            }

            $descriptionEn = null;
            $descriptionSi = null;
            $descriptionTa = null;

            if (mb_strlen($nameEn) > 250) {
                $descriptionEn = $nameEn;
                $nameEn = mb_substr($nameEn, 0, 250) . '...';
            }
            if (mb_strlen($nameSi) > 250) {
                $descriptionSi = $nameSi;
                $nameSi = mb_substr($nameSi, 0, 250) . '...';
            }
            if (mb_strlen($nameTa) > 250) {
                $descriptionTa = $nameTa;
                $nameTa = mb_substr($nameTa, 0, 250) . '...';
            }

            $slug = 'location-' . str_replace('.', '-', $number);

            $category = Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'name_en' => $nameEn,
                    'name_si' => $nameSi,
                    'name_ta' => $nameTa,
                    'description_en' => $descriptionEn,
                    'description_si' => $descriptionSi,
                    'description_ta' => $descriptionTa,
                    'parent_id' => $parentId,
                    'sort_order' => $sortOrder++,
                ]
            );

            $numberToId[$number] = $category->id;
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nLocations imported successfully!");
    }
}
