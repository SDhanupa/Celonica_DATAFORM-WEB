<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

// Check and add industry_surveys.reg_number
if (!Schema::hasColumn('industry_surveys', 'reg_number')) {
    Schema::table('industry_surveys', function (Blueprint $table) {
        $table->string('reg_number')->nullable()->after('id')->unique();
    });
    echo "Added reg_number to industry_surveys.\n";
}

// Check and add business_survey_questions.explanation_image
if (!Schema::hasColumn('business_survey_questions', 'explanation_image')) {
    Schema::table('business_survey_questions', function (Blueprint $table) {
        $table->string('explanation_image')->nullable()->after('explanation_ta');
    });
    echo "Added explanation_image to business_survey_questions.\n";
}

// Mark the migrations as completed to avoid artisan errors
DB::table('migrations')->updateOrInsert(['migration' => '2026_09_11_000001_add_reg_number_to_industry_surveys_table'], ['batch' => 2]);
DB::table('migrations')->updateOrInsert(['migration' => '2026_09_11_002007_add_explanation_image_to_business_survey_questions_table'], ['batch' => 2]);

echo "Database columns checked/updated.\n";
