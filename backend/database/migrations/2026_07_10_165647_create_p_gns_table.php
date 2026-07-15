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
        Schema::create('p_gns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('grama_niladhari_id')->nullable();
            $table->string('gn_name')->nullable();
            $table->integer('population_both')->default(0);
            $table->integer('population_male')->default(0);
            $table->integer('population_female')->default(0);
            $table->timestamps();

            $table->foreign('grama_niladhari_id')->references('id')->on('grama_niladharis')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('p_gns');
    }
};
