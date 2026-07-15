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
        Schema::table('p_district', function (Blueprint $table) {
            $table->unique('admin2Pcode');
        });

        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->foreign('district_code')->references('admin2Pcode')->on('p_district')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->dropForeign(['district_code']);
        });

        Schema::table('p_district', function (Blueprint $table) {
            $table->dropUnique(['admin2Pcode']);
        });
    }
};
