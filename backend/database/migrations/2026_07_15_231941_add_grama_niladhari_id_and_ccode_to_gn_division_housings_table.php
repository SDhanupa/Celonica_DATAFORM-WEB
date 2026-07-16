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
        Schema::table('gn_division_housings', function (Blueprint $table) {
            $table->unsignedBigInteger('grama_niladhari_id')->nullable();
            $table->string('CCODE')->nullable();
            
            $table->foreign('grama_niladhari_id')->references('id')->on('grama_niladharis')->onDelete('set null');
        });

        // Populate the data by matching gn_division with name_en
        \DB::statement('
            UPDATE gn_division_housings gdh
            SET 
                grama_niladhari_id = gn.id,
                "CCODE" = gn."CCODE"
            FROM grama_niladharis gn
            WHERE gdh.gn_division = gn.name_en
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gn_division_housings', function (Blueprint $table) {
            $table->dropForeign(['grama_niladhari_id']);
            $table->dropColumn('grama_niladhari_id');
            $table->dropColumn('CCODE');
        });
    }
};
