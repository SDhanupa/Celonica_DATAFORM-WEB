<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;

class ImportLocationsMdCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-locations-md';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import locations from category_hierarchy.md';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $path = 'D:\category_hierarchy.md';
        if (!file_exists($path)) {
            $this->error("Markdown file not found at $path");
            return;
        }

        $locationsJsonPath = storage_path('app/locations.json');
        $locationsData = file_exists($locationsJsonPath) ? json_decode(file_get_contents($locationsJsonPath), true) : [];
        $numberToTranslations = [];
        foreach($locationsData as $loc) {
            $numberToTranslations[(string)$loc['Number']] = [
                'name_si' => !empty($loc['Name ']) ? $loc['Name '] : null,
                'name_ta' => !empty($loc['Name ta']) ? $loc['Name ta'] : null,
            ];
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $numberToId = [];
        $sortOrder = 0;

        $this->info("Starting import...");
        $bar = $this->output->createProgressBar(count($lines));

        foreach ($lines as $line) {
            // Regex to extract Number and Name
            if (preg_match('/^[^a-zA-Z0-9]*([0-9]+(?:\.[0-9]+)+)[^a-zA-Z0-9]*(.+)$/', $line, $matches)) {
                $number = $matches[1];
                $name_en = trim($matches[2]);

                $parts = explode('.', $number);
                $parentId = null;
                
                // Traverse up by removing the last part until we find a parent
                while (count($parts) > 1) {
                    array_pop($parts);
                    $parentNumber = implode('.', $parts);
                    if (isset($numberToId[$parentNumber])) {
                        $parentId = $numberToId[$parentNumber];
                        break;
                    }
                }

                $name_si = $numberToTranslations[$number]['name_si'] ?? $name_en;
                $name_ta = $numberToTranslations[$number]['name_ta'] ?? null;

                $description_en = null;
                if (mb_strlen($name_en) > 250) {
                    $description_en = $name_en;
                    $name_en = mb_substr($name_en, 0, 250) . '...';
                }

                $description_si = null;
                if ($name_si && mb_strlen($name_si) > 250) {
                    $description_si = $name_si;
                    $name_si = mb_substr($name_si, 0, 250) . '...';
                }

                $description_ta = null;
                if ($name_ta && mb_strlen($name_ta) > 250) {
                    $description_ta = $name_ta;
                    $name_ta = mb_substr($name_ta, 0, 250) . '...';
                }

                $slug = 'location-' . str_replace('.', '-', $number);

                $category = Category::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name_en' => $name_en,
                        'name_si' => $name_si,
                        'name_ta' => $name_ta,
                        'description_en' => $description_en,
                        'description_si' => $description_si,
                        'description_ta' => $description_ta,
                        'parent_id' => $parentId,
                        'sort_order' => $sortOrder++,
                    ]
                );

                $numberToId[$number] = $category->id;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nCategories imported from Markdown successfully!");
    }
}
