<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use App\Models\Question;

class SeedLeafQuestions extends Command
{
    protected $signature = 'seed:leaf-questions';
    protected $description = 'Seed 5 default questions for every leaf category in the database.';

    public function handle()
    {
        $this->info('Finding all leaf categories...');
        
        // Find all categories that do NOT appear as a parent_id for any other category
        $parentIds = Category::whereNotNull('parent_id')->distinct()->pluck('parent_id');
        $leafCategories = Category::whereNotIn('id', $parentIds)->get();

        $this->info("Found {$leafCategories->count()} leaf categories. Seeding 5 questions for each...");

        $bar = $this->output->createProgressBar($leafCategories->count());
        $bar->start();

        $questionsToCreate = [
            ['en' => 'Name', 'si' => 'නම', 'type' => 'text'],
            ['en' => 'Status', 'si' => 'තත්ත්වය', 'type' => 'text'],
            ['en' => 'Remarks', 'si' => 'සටහන්', 'type' => 'text'],
            ['en' => 'Active?', 'si' => 'සක්‍රීයද?', 'type' => 'boolean'],
            ['en' => 'Value', 'si' => 'අගය', 'type' => 'number'],
        ];

        foreach ($leafCategories as $category) {
            foreach ($questionsToCreate as $index => $q) {
                // Use firstOrCreate to prevent duplicates if command is run multiple times
                Question::firstOrCreate(
                    [
                        'category_id' => $category->id,
                        'question_text_en' => $q['en'],
                    ],
                    [
                        'question_text_si' => $q['si'],
                        'input_type' => $q['type'],
                        'sort_order' => $index + 1,
                        'is_active' => true,
                    ]
                );
            }
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nSuccessfully seeded 5 questions for all leaf categories!");
    }
}
