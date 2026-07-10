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
        // Drop existing police tables
        Schema::dropIfExists('sinhala_police_stations');
        Schema::dropIfExists('gnd_police_mappings');
        Schema::dropIfExists('police_station_contacts');
        Schema::dropIfExists('police_divisions');

        Schema::create('police', function (Blueprint $table) {
            $table->id();
            $table->string('ccode')->nullable();
            $table->string('gnd_id')->nullable();
            $table->string('name')->nullable();
            $table->string('province_id')->nullable();
            $table->string('district_id')->nullable();
            $table->string('dsd_id')->nullable();
            $table->string('pd_id')->nullable();
            $table->string('gnd_num')->nullable();
            $table->string('lat')->nullable();
            $table->string('lng')->nullable();
            $table->string('ps_id')->nullable();
            $table->string('ps_name')->nullable();
            $table->string('ps_name_si')->nullable();
            $table->string('ps_name_ta')->nullable();
            $table->string('distance_to_the_police_station')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('police');
    }
};
