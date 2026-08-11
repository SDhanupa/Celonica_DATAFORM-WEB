<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->index('CCODE');
            $table->index('code');
        });

        Schema::table('gn_economies', function (Blueprint $table) {
            $table->index('gn_number');
        });

        Schema::table('housing_ownership_statuses', function (Blueprint $table) {
            $table->index('gn_id');
        });

        Schema::table('housing_wall_types', function (Blueprint $table) {
            $table->index('gn_id');
        });

        Schema::table('housing_unit_types', function (Blueprint $table) {
            $table->index('gn_id');
        });

        Schema::table('toilet_facilities', function (Blueprint $table) {
            $table->index('gn_id');
        });

        Schema::table('drinking_water_sources', function (Blueprint $table) {
            $table->index('gn_id');
        });

        Schema::table('solid_waste_disposals', function (Blueprint $table) {
            $table->index('gn_id');
        });

        Schema::table('rooms_in_housing_units', function (Blueprint $table) {
            $table->index('grama_niladhari_id');
        });

        Schema::table('housing_roof_types', function (Blueprint $table) {
            $table->index('grama_niladhari_id');
        });

        Schema::table('religious_affiliations', function (Blueprint $table) {
            $table->index('grama_niladhari_id');
        });

        Schema::table('household_head_relationships', function (Blueprint $table) {
            $table->index('grama_niladhari_id');
        });

        Schema::table('p_gns', function (Blueprint $table) {
            $table->index('grama_niladhari_id');
        });

        Schema::table('police', function (Blueprint $table) {
            $table->index('gnd_id');
        });
    }

    public function down(): void
    {
        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->dropIndex(['CCODE']);
            $table->dropIndex(['code']);
        });

        Schema::table('gn_economies', function (Blueprint $table) {
            $table->dropIndex(['gn_number']);
        });

        Schema::table('housing_ownership_status', function (Blueprint $table) {
            $table->dropIndex(['gn_id']);
        });

        Schema::table('housing_wall_types', function (Blueprint $table) {
            $table->dropIndex(['gn_id']);
        });

        Schema::table('housing_unit_types', function (Blueprint $table) {
            $table->dropIndex(['gn_id']);
        });

        Schema::table('toilet_facilities', function (Blueprint $table) {
            $table->dropIndex(['gn_id']);
        });

        Schema::table('drinking_water_sources', function (Blueprint $table) {
            $table->dropIndex(['gn_id']);
        });

        Schema::table('solid_waste_disposals', function (Blueprint $table) {
            $table->dropIndex(['gn_id']);
        });

        Schema::table('rooms_in_housing_units', function (Blueprint $table) {
            $table->dropIndex(['grama_niladhari_id']);
        });

        Schema::table('housing_roof_types', function (Blueprint $table) {
            $table->dropIndex(['grama_niladhari_id']);
        });

        Schema::table('religious_affiliations', function (Blueprint $table) {
            $table->dropIndex(['grama_niladhari_id']);
        });

        Schema::table('household_head_relationships', function (Blueprint $table) {
            $table->dropIndex(['grama_niladhari_id']);
        });

        Schema::table('p_gns', function (Blueprint $table) {
            $table->dropIndex(['grama_niladhari_id']);
        });

        Schema::table('police', function (Blueprint $table) {
            $table->dropIndex(['gnd_id']);
        });
    }
};
