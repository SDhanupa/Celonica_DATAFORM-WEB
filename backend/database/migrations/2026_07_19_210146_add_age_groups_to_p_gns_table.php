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
        Schema::table('p_gns', function (Blueprint $table) {
            $table->integer('age_0_14')->nullable();
            $table->integer('age_15_59')->nullable();
            $table->integer('age_60_64')->nullable();
            $table->integer('age_65_above')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('p_gns', function (Blueprint $table) {
            $table->dropColumn(['age_0_14', 'age_15_59', 'age_60_64', 'age_65_above']);
        });
    }
};
