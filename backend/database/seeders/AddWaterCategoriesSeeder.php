<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class AddWaterCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'number' => '1.8',
                'name' => 'Water Spaces',
                'name_si' => 'ජල මූලික අවකාශ',
                'children' => [
                    [
                        'number' => '1.8.1',
                        'name' => 'ස්වභාවික ජල පිහිටීම්',
                        'children' => [
                            ['number' => '1.8.1.1', 'name' => 'ගංගාව'],
                            ['number' => '1.8.1.2', 'name' => 'ගංගා භූ ලක්ෂණ'],
                        ]
                    ],
                    [
                        'number' => '1.8.2',
                        'name' => 'මුහුදු',
                        'children' => [
                            ['number' => '1.8.2.1', 'name' => 'තුඩුව'],
                            ['number' => '1.8.2.2', 'name' => 'දූපත'],
                            ['number' => '1.8.2.3', 'name' => 'පරය'],
                            ['number' => '1.8.2.4', 'name' => 'කලපුව'],
                            ['number' => '1.8.2.5', 'name' => 'මුහුදු දඹය ( sea cliff)'],
                            ['number' => '1.8.2.6', 'name' => 'මුහුදු ගුහා (Sea cave)'],
                            ['number' => '1.8.2.7', 'name' => 'වා සිදුර (උම්මාන / හුම්මාන) (spouting horn)'],
                            ['number' => '1.8.2.8', 'name' => 'ආරුක්කුව (Arch)'],
                            ['number' => '1.8.2.9', 'name' => 'මුහුදු කුළ (sea stack)'],
                            ['number' => '1.8.2.10', 'name' => 'බොක්ක( Bay)'],
                            ['number' => '1.8.2.11', 'name' => 'වැල්ල'],
                            ['number' => '1.8.2.12', 'name' => 'වැලි වැටි'],
                            ['number' => '1.8.2.13', 'name' => 'රළබුම් වේදිකා'],
                            ['number' => '1.8.2.14', 'name' => 'බොකු පර'],
                            ['number' => '1.8.2.15', 'name' => 'වෙරළබඩ පරය'],
                            ['number' => '1.8.2.16', 'name' => 'ටොම්බොලෝ'],
                            ['number' => '1.8.2.17', 'name' => 'මඩතලා'],
                        ]
                    ],
                    [
                        'number' => '1.8.3',
                        'name' => 'ගංගා නොවන ස්වභාවික ජල නිර්මිත',
                        'children' => [
                            ['number' => '1.8.3.1', 'name' => 'දිය පහර'],
                            ['number' => '1.8.3.2', 'name' => 'පොකුණ'],
                            ['number' => '1.8.3.3', 'name' => 'දිය වල'],
                            ['number' => '1.8.3.4', 'name' => 'විල'],
                            ['number' => '1.8.3.5', 'name' => 'උල්පත'],
                        ]
                    ],
                    [
                        'number' => '1.8.4',
                        'name' => 'ජල නිර්මිත',
                        'children' => [
                            ['number' => '1.8.4.1', 'name' => 'ළිඳ'],
                            ['number' => '1.8.4.2', 'name' => 'ජලාශය'],
                            ['number' => '1.8.4.3', 'name' => 'වැව'],
                            ['number' => '1.8.4.4', 'name' => 'වාරි ඇල'],
                        ]
                    ]
                ]
            ]
        ];

        $this->seedCategories($data, null);
        
        $this->command->info("Successfully seeded Water Categories safely!");
    }

    private function seedCategories($categories, $parentId = null)
    {
        $sortOrder = 1;

        foreach ($categories as $item) {
            $nameEn = $item['name'];
            $nameSi = $item['name_si'] ?? $item['name'];
            $number = $item['number'];

            $category = Category::firstOrCreate(
                [
                    // Identify safely by exact name
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
