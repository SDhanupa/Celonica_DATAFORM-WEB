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
            $table->string('pro_en')->nullable()->after('name_ta');
            $table->string('pro_si')->nullable()->after('pro_en');
            $table->string('pro_ta')->nullable()->after('pro_si');
            
            // Note: dis_en is already created in the original migration
            $table->string('dis_si')->nullable()->after('dis_en');
            $table->string('dis_ta')->nullable()->after('dis_si');
            
            $table->string('ds_en')->nullable()->after('dis_ta');
            $table->string('ds_si')->nullable()->after('ds_en');
            $table->string('ds_ta')->nullable()->after('ds_si');
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
                'dis_si', 'dis_ta',
                'ds_en', 'ds_si', 'ds_ta'
            ]);
        });
    }
};
