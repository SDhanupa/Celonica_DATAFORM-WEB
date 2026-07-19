<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gn_economies', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();                          // GN Division name
            $table->string('gn_number')->nullable();                     // GN number
            $table->bigInteger('total')->nullable();                     // Total population
            $table->bigInteger('employed')->nullable();                  // Employed count
            $table->bigInteger('unemployed')->nullable();                // Unemployed count
            $table->bigInteger('economically_not_active')->nullable();   // Economically not active
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gn_economies');
    }
};
