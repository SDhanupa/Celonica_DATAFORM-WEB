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
        Schema::create('grama_niladharis', function (Blueprint $table) {
            $table->id();
            $table->string('province_code')->nullable();
            $table->string('PCCODE')->nullable();
            $table->string('district_code')->nullable();
            $table->string('DCCODE')->nullable();
            $table->string('divisional_secretariat_code')->nullable();
            $table->string('DSCCODE')->nullable();
            $table->string('code')->nullable();
            $table->string('CCODE')->nullable();
            $table->string('name_si')->nullable();
            $table->string('name_en')->nullable();
            $table->string('name_ta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grama_niladharis');
    }
};
