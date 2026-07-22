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
        Schema::create('toilet_facilities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gn_id')->nullable();
            $table->string('gn_name')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->integer('total_households')->default(0);
            $table->integer('water_seal_piped_sewer')->default(0);
            $table->integer('water_seal_septic_tank')->default(0);
            $table->integer('pour_flush')->default(0);
            $table->integer('direct_pit')->default(0);
            $table->integer('other')->default(0);
            $table->integer('not_using')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toilet_facilities');
    }
};
