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
        Schema::table('questions', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->renameColumn('question_text', 'question_text_en');
            $table->text('question_text_si')->nullable();
            $table->string('section')->nullable()->change(); // existing section becomes nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
            $table->renameColumn('question_text_en', 'question_text');
            $table->dropColumn('question_text_si');
            $table->string('section')->nullable(false)->change();
        });
    }
};
