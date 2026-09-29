<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('business_survey_questions', function (Blueprint $table) {
            $table->text('explanation_en')->nullable()->after('question_ta');
            $table->text('explanation_si')->nullable()->after('explanation_en');
            $table->text('explanation_ta')->nullable()->after('explanation_si');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_survey_questions', function (Blueprint $table) {
            $table->dropColumn(['explanation_en', 'explanation_si', 'explanation_ta']);
        });
    }
};
