<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class AddWetZoneSubcategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Find the parent category: "Wet Zone"
        $wetZone = Category::where('name_en', 'like', '%Wet Zone%')
            ->orWhere('name_si', 'like', '%Wet Zone%')
            ->first();

        if (!$wetZone) {
            $this->command->error("Parent category 'Wet Zone' not found! Cannot insert subcategories.");
            return;
        }

        $this->command->info("Found parent category: {$wetZone->name_en}");

        $subcategories = [
            'WL1a' => 'WL1a කෘෂි- පාරිසරික කලාපය',
            'WL1b' => 'WL1b කෘෂි- පාරිසරික කලාපය',
            'WL2a' => 'WL2a කෘෂි- පාරිසරික කලාපය',
            'WL2b' => 'WL2b කෘෂි- පාරිසරික කලාපය',
            'WL3'  => 'WL3 කෘෂි- පාරිසරික කලාපය',
            'WM1a' => 'WM1a කෘෂි- පාරිසරික කලාපය',
            'WM1b' => 'WM1b කෘෂි- පාරිසරික කලාපය',
            'WM2a' => 'WM2a කෘෂි- පාරිසරික කලාපය',
            'WM2b' => 'WM2b කෘෂි- පාරිසරික කලාපය',
            'WM3a' => 'WM3a කෘෂි- පාරිසරික කලාපය',
            'WM3b' => 'WM3b කෘෂි- පාරිසරික කලාපය',
            'WU1'  => 'WU1 කෘෂි- පාරිසරික කලාපය',
            'WU2a' => 'WU2a කෘෂි- පාරිසරික කලාපය',
            'WU2b' => 'WU2b කෘෂි- පාරිසරික කලාපය',
            'WU3'  => 'WU3 කෘෂි- පාරිසරික කලාපය'
        ];

        foreach ($subcategories as $code => $nameSi) {
            $nameEn = "{$code} Agro-Ecological Zone";
            $slug = Str::slug($nameEn);

            Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'parent_id' => $wetZone->id,
                    'name_en' => $nameEn,
                    'name_si' => $nameSi,
                    'description_en' => "{$nameEn} in the Wet Zone",
                    'description_si' => $nameSi,
                    'sort_order' => 0,
                ]
            );
        }

        $this->command->info('Successfully added 15 Wet Zone subcategories!');
    }
}
