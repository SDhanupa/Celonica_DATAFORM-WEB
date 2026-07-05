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
            $table->boolean('is_repeater')->default(false)->after('input_type');
        });

        Schema::table('user_answers', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'question_id']);
            $table->integer('iteration')->default(1)->after('question_id');
            $table->unique(['user_id', 'question_id', 'iteration']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_answers', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'question_id', 'iteration']);
            $table->dropColumn('iteration');
            $table->unique(['user_id', 'question_id']);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('is_repeater');
        });
    }
};
