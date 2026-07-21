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
        Schema::create('housing_unit_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gn_id')->nullable();
            $table->string('gn_name')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->integer('total_units')->default(0);
            $table->integer('permanent')->default(0);
            $table->integer('semi_permanent')->default(0);
            $table->integer('improvised')->default(0);
            $table->integer('unclassified')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('housing_unit_types');
    }
};
