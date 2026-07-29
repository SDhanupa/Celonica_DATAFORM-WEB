<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class AddBoundariesCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/boundaries.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("Could not find the boundaries.json data file at {$jsonPath}");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);
        $this->command->info('Loaded ' . count($data) . ' categories from JSON.');

        // We will keep a map of "Full Name" => Category ID so we can properly link parents
        $idMap = [];

        // Ensure "1 - Location" root category exists first
        $rootCategory = Category::firstOrCreate(
            ['name_en' => 'Location'],
            [
                'slug' => 'location-root',
                'name_si' => 'ස්ථානය',
                'sort_order' => 1,
            ]
        );
        $idMap['1 - Location'] = $rootCategory->id;

        $count = 0;

        foreach ($data as $item) {
            $number = $item['number'];
            $name = $item['name'];
            $fullName = $item['fullName'];
            $parentFullName = $item['parentFullName'];

            // 1. Identify the parent ID
            $parentId = $rootCategory->id; // Fallback
            if ($parentFullName && isset($idMap[$parentFullName])) {
                $parentId = $idMap[$parentFullName];
            } else if ($parentFullName) {
                // If the parent hasn't been created yet for some reason (which shouldn't happen if JSON is sorted)
                // we try to find it by name
                $parentNameOnly = trim(explode('-', $parentFullName)[1] ?? $parentFullName);
                $existingParent = Category::where('name_si', $parentNameOnly)->orWhere('name_en', $parentNameOnly)->first();
                if ($existingParent) {
                    $parentId = $existingParent->id;
                    $idMap[$parentFullName] = $parentId;
                }
            }

            // 2. We use the pure Name to identify if it exists (As requested: "identfy using name not 1.1 number")
            // This guarantees we don't insert a duplicate if a category with this exact name already exists.
            $category = Category::firstOrCreate(
                [
                    // Identify safely by the exact name
                    'name_si' => $name
                ],
                [
                    // This block ONLY runs if it does NOT exist.
                    'parent_id' => $parentId,
                    'name_en' => $name, // Fallback English name to the same since it's mixed
                    // Generate a safe unique slug using the number to prevent Sinhala string crash
                    'slug' => 'boundary-' . str_replace('.', '-', $number), 
                    'description_en' => $name,
                    'description_si' => $name,
                    'sort_order' => $count + 1,
                ]
            );

            // Store in our map for the next children
            $idMap[$fullName] = $category->id;
            $count++;
        }

        $this->command->info("Successfully processed and safely added {$count} Boundaries categories!");
    }
}
