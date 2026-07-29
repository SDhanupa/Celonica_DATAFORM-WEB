<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Facades\File;

class AddFullLocationDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/all_locations.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("Could not find the all_locations.json data file at {$jsonPath}");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);
        $this->command->info('Loaded ' . count($data) . ' categories from JSON.');

        // 1. Find all the existing Root Categories based on the UI names provided
        $rootMappings = [
            '1.1' => 'Boundaries',
            '1.2' => 'Space',
            '1.3' => 'Land',
            '1.4' => 'Building',
            '1.5' => 'Road',
            '1.6' => 'Geo-type',
            '1.7' => 'Plants',
        ];

        $rootIds = [];

        foreach ($rootMappings as $num => $rootName) {
            $category = Category::where('name_en', 'like', "%{$rootName}%")
                                ->orWhere('name_si', 'like', "%{$rootName}%")
                                ->first();
            
            if ($category) {
                $rootIds[$num] = $category->id;
                $this->command->info("Found root for {$num}: {$category->name_en}");
            } else {
                $this->command->warn("Could not find root category in DB for: {$rootName}");
            }
        }

        $idMap = [];
        $count = 0;
        $skipped = 0;

        foreach ($data as $item) {
            $number = $item['number'];
            $name = $item['name'];
            $fullName = $item['fullName'];
            $parentFullName = $item['parentFullName'];

            // Identify which root tree this belongs to (e.g. "1.1.1.1" -> starts with "1.1")
            $topLevelMatch = substr($number, 0, 3); // Extracts "1.1", "1.2", etc.
            
            // If this is one of the top level items itself (e.g. number == "1.1"), 
            // we just store its DB ID in the idMap so its children can find it.
            if (isset($rootIds[$topLevelMatch]) && $number === $topLevelMatch) {
                $idMap[$fullName] = $rootIds[$topLevelMatch];
                continue; // We don't recreate the root category!
            }

            // If we don't have a matching root category, we skip to avoid messing up the DB
            if (!isset($rootIds[$topLevelMatch])) {
                continue;
            }

            // 1. Identify the parent ID dynamically
            $parentId = $rootIds[$topLevelMatch]; // Fallback to the root (e.g. Boundaries)
            if ($parentFullName && isset($idMap[$parentFullName])) {
                $parentId = $idMap[$parentFullName];
            } else if ($parentFullName) {
                // Try finding by name in DB as a fallback
                $parentNameOnly = trim(explode('-', $parentFullName)[1] ?? $parentFullName);
                $existingParent = Category::where('name_si', $parentNameOnly)->orWhere('name_en', $parentNameOnly)->first();
                if ($existingParent) {
                    $parentId = $existingParent->id;
                    $idMap[$parentFullName] = $parentId;
                }
            }

            // 2. Safely create ONLY if it doesn't exist. This protects manually added subcategories and images!
            $existingCat = Category::where('name_si', $name)->orWhere('name_en', $name)->first();

            if ($existingCat) {
                $idMap[$fullName] = $existingCat->id;
                $skipped++;
            } else {
                $newCat = Category::create([
                    'parent_id' => $parentId,
                    'name_en' => $name,
                    'name_si' => $name,
                    'slug' => 'location-' . str_replace('.', '-', $number), 
                    'description_en' => $name,
                    'description_si' => $name,
                    'sort_order' => $count + 1,
                ]);
                $idMap[$fullName] = $newCat->id;
                $count++;
            }
        }

        $this->command->info("Finished! Successfully added {$count} new categories. Safely skipped {$skipped} existing/manually added categories.");
    }
}
