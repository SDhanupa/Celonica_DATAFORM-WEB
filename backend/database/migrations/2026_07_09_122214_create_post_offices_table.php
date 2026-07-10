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
        Schema::create('post_offices', function (Blueprint $table) {
            $table->id();
            $table->string('country_code')->nullable();
            $table->string('province')->nullable();
            $table->string('province_code')->nullable();
            $table->string('district')->nullable();
            $table->string('disid')->nullable();
            $table->string('ds_aga')->nullable();
            $table->string('ds_code')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('place_name_english')->nullable();
            $table->string('sinhala')->nullable();
            $table->string('tamil')->nullable();
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->string('accuracy')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_offices');
    }
};
