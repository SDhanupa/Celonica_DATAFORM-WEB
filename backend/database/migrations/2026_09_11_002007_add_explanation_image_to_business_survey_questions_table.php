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
            $table->string('explanation_image')->nullable()->after('explanation_ta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_survey_questions', function (Blueprint $table) {
            $table->dropColumn('explanation_image');
        });
    }
};
