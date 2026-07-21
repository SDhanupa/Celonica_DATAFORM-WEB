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
        Schema::create('housing_wall_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gn_id')->nullable();
            $table->string('gn_name')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->integer('total_units')->default(0);
            $table->integer('brick')->default(0);
            $table->integer('cement_block_stone')->default(0);
            $table->integer('cabook')->default(0);
            $table->integer('soil_bricks')->default(0);
            $table->integer('mud')->default(0);
            $table->integer('cadjan_palmyrah')->default(0);
            $table->integer('plank_metal_sheet')->default(0);
            $table->integer('other')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_wall_types');
    }
};
