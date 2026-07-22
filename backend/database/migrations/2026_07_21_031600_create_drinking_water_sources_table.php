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
        Schema::create('drinking_water_sources', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gn_id')->nullable();
            $table->string('gn_name')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->integer('total_households')->default(0);
            $table->integer('protected_well_within')->default(0);
            $table->integer('protected_well_outside')->default(0);
            $table->integer('unprotected_well')->default(0);
            $table->integer('tap_within_unit')->default(0);
            $table->integer('tap_within_premises_outside')->default(0);
            $table->integer('tap_outside_premises')->default(0);
            $table->integer('rural_water_projects')->default(0);
            $table->integer('tube_well')->default(0);
            $table->integer('bowser')->default(0);
            $table->integer('river_tank_stream')->default(0);
            $table->integer('other')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drinking_water_sources');
    }
};
