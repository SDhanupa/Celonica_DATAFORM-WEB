<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Question;

class CommonQuestionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get all leaf categories (categories that have no children)
        $leafCategories = Category::doesntHave('children')->get();

        foreach ($leafCategories as $category) {
            // First common question: Name
            Question::updateOrCreate([
                'category_id' => $category->id,
                'question_text_en' => 'Name',
            ], [
                'section' => 'General',
                'question_text_si' => 'නම',
                'question_text_ta' => 'பெயர்',
                'input_type' => 'text',
                'is_active' => true,
                'is_repeater' => false,
                'sort_order' => 1,
            ]);

            // Second common question: Description
            Question::updateOrCreate([
                'category_id' => $category->id,
                'question_text_en' => 'Description',
            ], [
                'section' => 'General',
                'question_text_si' => 'විස්තරය',
                'question_text_ta' => 'விளக்கம்',
                'input_type' => 'textarea',
                'is_active' => true,
                'is_repeater' => false,
                'sort_order' => 2,
            ]);

            // Third common question: Address
            Question::updateOrCreate([
                'category_id' => $category->id,
                'question_text_en' => 'Address',
            ], [
                'section' => 'General',
                'question_text_si' => 'ලිපිනය',
                'question_text_ta' => 'முகவரி',
                'input_type' => 'textarea',
                'is_active' => true,
                'is_repeater' => false,
                'sort_order' => 3,
            ]);
        }
    }
}
