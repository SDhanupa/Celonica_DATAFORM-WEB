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
        Schema::create('solid_waste_disposals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gn_id')->nullable();
            $table->string('gn_name')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->integer('total_households')->default(0);
            $table->integer('collected_by_local_authorities')->default(0);
            $table->integer('occupants_burn')->default(0);
            $table->integer('occupants_bury')->default(0);
            $table->integer('occupants_composting')->default(0);
            $table->integer('dispose_into_environment')->default(0);
            $table->integer('other')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solid_waste_disposals');
    }
};
