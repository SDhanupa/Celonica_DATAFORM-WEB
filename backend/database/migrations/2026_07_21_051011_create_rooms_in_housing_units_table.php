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
        Schema::create('rooms_in_housing_units', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('grama_niladhari_id')->nullable();
            $table->string('gn_name')->nullable();
            
            $table->integer('total_housing_units')->default(0);
            $table->integer('room_1')->default(0);
            $table->integer('rooms_2')->default(0);
            $table->integer('rooms_3')->default(0);
            $table->integer('rooms_4')->default(0);
            $table->integer('rooms_5')->default(0);
            $table->integer('rooms_6')->default(0);
            $table->integer('rooms_7')->default(0);
            $table->integer('rooms_8')->default(0);
            $table->integer('rooms_9')->default(0);
            $table->integer('rooms_10_and_above')->default(0);

            $table->timestamps();

            // Foreign key to grama_niladharis
            $table->foreign('grama_niladhari_id')
                  ->references('id')
                  ->on('grama_niladharis')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms_in_housing_units');
    }
};
