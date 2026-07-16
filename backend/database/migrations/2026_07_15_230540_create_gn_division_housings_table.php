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
        Schema::create('gn_division_housings', function (Blueprint $table) {
            $table->id();
            $table->string('gn_division')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->integer('total_housing_units')->nullable();
            $table->integer('y_2011')->nullable();
            $table->integer('y_2010')->nullable();
            $table->integer('y_2009')->nullable();
            $table->integer('y_2008')->nullable();
            $table->integer('y_2007')->nullable();
            $table->integer('y_2006')->nullable();
            $table->integer('y_2005')->nullable();
            $table->integer('y_2000_2004')->nullable();
            $table->integer('y_1995_1999')->nullable();
            $table->integer('y_1990_1994')->nullable();
            $table->integer('y_1980_1989')->nullable();
            $table->integer('before_80')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gn_division_housings');
    }
};
