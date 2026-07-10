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
        Schema::create('sinhala_police_stations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('police_division_id')->nullable()->constrained('police_divisions')->nullOnDelete();
            $table->string('province')->nullable();
            $table->string('district')->nullable();
            $table->string('division')->nullable();
            $table->string('station_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sinhala_police_stations');
    }
};
