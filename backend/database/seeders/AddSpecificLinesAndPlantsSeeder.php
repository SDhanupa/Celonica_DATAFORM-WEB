<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class AddSpecificLinesAndPlantsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            // Lines Tree
            [
                'number' => '1.9',
                'name' => 'Lines',
                'children' => [
                    [
                        'number' => '1.9.1',
                        'name' => 'Electricity',
                        'children' => [
                            ['number' => '1.9.1.1', 'name' => '220kV Line'],
                            ['number' => '1.9.1.2', 'name' => '132kV Underground Cable'],
                            ['number' => '1.9.1.3', 'name' => '132kV Line'],
                            ['number' => '1.9.1.4', 'name' => 'To be commissioned'],
                        ]
                    ],
                    ['number' => '1.9.2', 'name' => 'Communication Lines'],
                    ['number' => '1.9.3', 'name' => 'Water pipe line'],
                    ['number' => '1.9.4', 'name' => 'Drainage Lines'],
                ]
            ],
            // Plants Tree
            [
                'number' => '1.7',
                'name' => 'Plants', // Let's use the english name to link to the existing root
                'name_si' => 'ස්වභාවික පිහිටීම',
                'children' => [
                    ['number' => '1.7.1', 'name' => 'වගුර'],
                    ['number' => '1.7.2', 'name' => 'කඩොලාන'],
                    ['number' => '1.7.3', 'name' => 'ප්රාථමික වනාන්තරය'],
                    ['number' => '1.7.4', 'name' => 'ද්විතීයක වනාන්තරය'],
                    ['number' => '1.7.5', 'name' => 'කටු පඳුරු සහිත ලඳු බිම'],
                    ['number' => '1.7.6', 'name' => 'පතන් බිම'],
                    ['number' => '1.7.7', 'name' => 'තලාව'],
                ]
            ]
        ];

        $this->seedCategories($data, null);
        
        $this->command->info("Successfully seeded Specific Lines and Plants categories safely!");
    }

    private function seedCategories($categories, $parentId = null)
    {
        $sortOrder = 1;

        foreach ($categories as $item) {
            $nameEn = $item['name'];
            $nameSi = $item['name_si'] ?? $item['name'];
            $number = $item['number'];

            // Safely look up or create
            // If it's a root category like Plants or Lines, we might already have it.
            $category = Category::firstOrCreate(
                [
                    // Identify by Sinhala name or English name to prevent duplicates
                    'name_si' => $nameSi
                ],
                [
                    'parent_id' => $parentId,
                    'name_en' => $nameEn,
                    'slug' => 'cat-' . str_replace('.', '-', $number) . '-' . substr(md5($nameSi), 0, 6),
                    'description_en' => $nameEn,
                    'description_si' => $nameSi,
                    'sort_order' => $sortOrder,
                ]
            );

            // If it has children, recurse
            if (isset($item['children'])) {
                $this->seedCategories($item['children'], $category->id);
            }

            $sortOrder++;
        }
    }
}
