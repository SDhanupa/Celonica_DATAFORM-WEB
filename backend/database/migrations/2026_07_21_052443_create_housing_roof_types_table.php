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
        Schema::create('housing_roof_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grama_niladhari_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('gn_name')->nullable();
            $table->integer('total_housing_units')->nullable();
            $table->integer('tile')->nullable();
            $table->integer('asbestos')->nullable();
            $table->integer('concrete')->nullable();
            $table->integer('zink_aluminium_sheet')->nullable();
            $table->integer('metal_sheet')->nullable();
            $table->integer('cadjan_palmyrah_straw')->nullable();
            $table->integer('other')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_roof_types');
    }
};
