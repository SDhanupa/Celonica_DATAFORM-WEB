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
        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->string('pro_en')->nullable();
            $table->string('pro_si')->nullable();
            $table->string('pro_ta')->nullable();
            $table->string('dis_en')->nullable();
            $table->string('dis_si')->nullable();
            $table->string('dis_ta')->nullable();
            $table->string('ds_en')->nullable();
            $table->string('ds_si')->nullable();
            $table->string('ds_ta')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->dropColumn([
                'pro_en', 'pro_si', 'pro_ta',
                'dis_en', 'dis_si', 'dis_ta',
                'ds_en', 'ds_si', 'ds_ta'
            ]);
        });
    }
};
