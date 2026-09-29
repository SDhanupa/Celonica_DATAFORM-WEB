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
        Schema::create('business_survey_questions', function (Blueprint $table) {
            $table->id();
            $table->integer('step_index');
            $table->string('field_key')->unique();
            $table->string('type')->default('text'); // text, select, multiselect, custom
            $table->text('question_en')->nullable();
            $table->text('question_si')->nullable();
            $table->text('question_ta')->nullable();
            $table->json('options_json')->nullable(); // Stores { en: [], si: [], ta: [] }
            $table->string('depends_on')->nullable(); // e.g. "q_legal_status:7"
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_survey_questions');
    }
};
