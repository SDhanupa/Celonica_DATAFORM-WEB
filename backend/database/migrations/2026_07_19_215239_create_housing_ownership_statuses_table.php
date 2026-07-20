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
        Schema::create('housing_ownership_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('gn_name')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->integer('total_households')->nullable();
            $table->integer('owned_by_member')->nullable();
            $table->integer('rent_gov')->nullable();
            $table->integer('rent_private')->nullable();
            $table->integer('free_of_rent')->nullable();
            $table->integer('encroached')->nullable();
            $table->integer('other')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_ownership_statuses');
    }
};
