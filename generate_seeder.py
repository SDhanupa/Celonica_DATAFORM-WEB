import json
import time
from deep_translator import GoogleTranslator

# Load questions
questions = json.load(open("structured_questions.json", encoding="utf-8"))

# Prepare translators
en_translator = GoogleTranslator(source="si", target="en")
ta_translator = GoogleTranslator(source="si", target="ta")

php_code = """<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;

class IndustryQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
"""

sort_order = 10
count = 0
for i, q in enumerate(questions):
    try:
        text_si = q["text_si"].strip()
        num = q["number"].strip()
        options = q["options_si"].strip()
        
        # Determine type
        input_type = "text"
        if options:
            input_type = "select"
            if "_________________________" in options:
                input_type = "text"

        if num == "අංකය" or "Auto" in text_si:
            continue
            
        en_text = en_translator.translate(text_si)
        ta_text = ta_translator.translate(text_si)
        
        # Escape quotes for PHP
        text_si = text_si.replace("\"", "\\\"").replace("\'", "\\\'")
        en_text = en_text.replace("\"", "\\\"").replace("\'", "\\\'")
        ta_text = ta_text.replace("\"", "\\\"").replace("\'", "\\\'")

        php_code += f"            ['num' => '{num}', 'en' => '{en_text}', 'si' => '{text_si}', 'ta' => '{ta_text}', 'type' => '{input_type}'],\n"
        count += 1
        print(f"Translated {i+1}/{len(questions)}: {num}")
    except Exception as e:
        print(f"Failed on {num}: {e}")

php_code += """        ];

        // Delete old before seeding
        Question::where('section', 'INDUSTRY_SURVEY')->delete();

        $sortOrder = 10;
        foreach ($questions as $q) {
            $prefix = $q['num'] . ' ';
            Question::create([
                "section" => "INDUSTRY_SURVEY",
                "question_text_en" => $prefix . $q["en"],
                "question_text_si" => $prefix . $q["si"],
                "question_text_ta" => $prefix . $q["ta"],
                "input_type" => $q['type'],
                "is_repeater" => false,
                "sort_order" => $sortOrder,
                "is_active" => true,
                "is_standard" => true,
            ]);
            $sortOrder += 10;
        }
    }
}
"""

with open("backend/database/seeders/IndustryQuestionsSeeder.php", "w", encoding="utf-8") as f:
    f.write(php_code)

print(f"Seeder generated successfully! Total questions: {count}")
