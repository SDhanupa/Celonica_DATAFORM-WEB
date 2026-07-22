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
        Schema::create('religious_affiliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grama_niladhari_id')->nullable()->constrained('grama_niladharis')->onDelete('cascade');
            $table->string('gn_name')->nullable();
            $table->integer('total_population')->default(0);
            $table->integer('buddhist')->default(0);
            $table->integer('hindu')->default(0);
            $table->integer('islam')->default(0);
            $table->integer('roman_catholic')->default(0);
            $table->integer('other_christian')->default(0);
            $table->integer('other')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('religious_affiliations');
    }
};
