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
        Schema::create('police_station_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('police_division_id')->nullable()->constrained('police_divisions')->nullOnDelete();
            $table->string('province')->nullable();
            $table->string('division')->nullable();
            $table->string('station_name')->nullable();
            $table->string('oic_mobile')->nullable();
            $table->string('office_telephone')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('police_station_contacts');
    }
};
