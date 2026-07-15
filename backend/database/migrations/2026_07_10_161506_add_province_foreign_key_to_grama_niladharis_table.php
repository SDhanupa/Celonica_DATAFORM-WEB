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
        Schema::table('p_province', function (Blueprint $table) {
            $table->unique('admin1Pcode');
        });

        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->foreign('province_code')->references('admin1Pcode')->on('p_province')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->dropForeign(['province_code']);
        });

        Schema::table('p_province', function (Blueprint $table) {
            $table->dropUnique(['admin1Pcode']);
        });
    }
};
