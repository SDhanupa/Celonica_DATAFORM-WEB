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
        Schema::create('phi_areas', function (Blueprint $table) {
            $table->id();
            $table->string('ccode')->nullable();
            $table->string('code')->nullable();
            $table->string('location')->nullable();
            $table->string('full_location_name')->nullable();
            $table->string('location_type')->nullable();
            $table->string('name_si')->nullable();
            $table->string('name_en')->nullable();
            $table->string('name_ta')->nullable();
            $table->string('district')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phi_areas');
    }
};
