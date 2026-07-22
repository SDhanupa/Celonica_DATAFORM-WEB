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
        Schema::create('household_head_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grama_niladhari_id')->nullable()->constrained('grama_niladharis')->onDelete('cascade');
            $table->string('gn_name')->nullable();
            $table->integer('total_population')->default(0);
            $table->integer('head')->default(0);
            $table->integer('wife_husband')->default(0);
            $table->integer('son_daughter')->default(0);
            $table->integer('son_daughter_in_law')->default(0);
            $table->integer('grandchild_great_grandchild')->default(0);
            $table->integer('parent_of_head_or_spouse')->default(0);
            $table->integer('other_relative')->default(0);
            $table->integer('domestic_employee')->default(0);
            $table->integer('boarder')->default(0);
            $table->integer('non_relative')->default(0);
            $table->integer('clergy')->default(0);
            $table->integer('not_stated')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_head_relationships');
    }
};
