<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Question;
use App\Models\UserAnswer;
use Illuminate\Support\Facades\DB;

class StandardSurveyQuestionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate existing questions and answers to avoid orphaned data
        DB::statement('TRUNCATE TABLE user_answers RESTART IDENTITY CASCADE');
        DB::statement('TRUNCATE TABLE questions RESTART IDENTITY CASCADE');

        $leafCategories = Category::doesntHave('children')->get();

        $standardQuestions = [
            ['en' => 'Image', 'si' => 'පින්තූරය', 'ta' => 'படம்', 'type' => 'image', 'section' => 'General'],
            ['en' => 'Reg Number', 'si' => 'ලියාපදිංචි අංකය', 'ta' => 'பதிவு எண்', 'type' => 'text', 'section' => 'General'],
            ['en' => 'Name (EN)', 'si' => 'නම (ඉංග්‍රීසි)', 'ta' => 'பெயர் (ஆங்கிலம்)', 'type' => 'text', 'section' => 'General'],
            ['en' => 'Name (SI)', 'si' => 'නම (සිංහල)', 'ta' => 'பெயர் (சிங்களம்)', 'type' => 'text', 'section' => 'General'],
            ['en' => 'Name (TA)', 'si' => 'නම (දෙමළ)', 'ta' => 'பெயர் (தமிழ்)', 'type' => 'text', 'section' => 'General'],
            ['en' => 'National', 'si' => 'ජාතික', 'ta' => 'தேசிய', 'type' => 'boolean', 'section' => 'General'],
            ['en' => 'Province', 'si' => 'පළාත', 'ta' => 'மாகாணம்', 'type' => 'location_province', 'section' => 'Location'],
            ['en' => 'District', 'si' => 'දිස්ත්‍රික්කය', 'ta' => 'மாவட்டம்', 'type' => 'location_district', 'section' => 'Location'],
            ['en' => 'DS Division', 'si' => 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය', 'ta' => 'பிரதேச செயலகம்', 'type' => 'location_ds', 'section' => 'Location'],
            ['en' => 'GN Name', 'si' => 'ග්‍රාම නිලධාරී වසම', 'ta' => 'கிராம உத்தியோகத்தர் பிரிவு', 'type' => 'location_gn', 'section' => 'Location'],
            ['en' => 'Mobile', 'si' => 'ජංගම දුරකථනය', 'ta' => 'கைபேசி', 'type' => 'text', 'section' => 'Contact'],
            ['en' => 'Contact Person', 'si' => 'සම්බන්ධ විය යුතු පුද්ගලයා', 'ta' => 'தொடர்பு கொள்ள வேண்டிய நபர்', 'type' => 'text', 'section' => 'Contact'],
            ['en' => 'Address', 'si' => 'ලිපිනය', 'ta' => 'முகவரி', 'type' => 'text', 'section' => 'Contact'],
            ['en' => 'Longitude', 'si' => 'දේශාංශ', 'ta' => 'தீர்க்கரேகை', 'type' => 'number', 'section' => 'Location'],
            ['en' => 'Latitude', 'si' => 'අක්ෂාංශ', 'ta' => 'அட்சரேகை', 'type' => 'number', 'section' => 'Location'],
        ];

        foreach ($leafCategories as $category) {
            $order = 1;
            foreach ($standardQuestions as $q) {
                Question::create([
                    'category_id' => $category->id,
                    'section' => $q['section'],
                    'question_text_en' => $q['en'],
                    'question_text_si' => $q['si'],
                    'question_text_ta' => $q['ta'],
                    'input_type' => $q['type'],
                    'sort_order' => $order++,
                    'is_active' => true,
                    'is_repeater' => false,
                    'is_standard' => true,
                ]);
            }
        }
    }
}
