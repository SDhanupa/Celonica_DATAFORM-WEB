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
        Schema::table('housing_ownership_statuses', function (Blueprint $table) {
            $table->unsignedBigInteger('gn_id')->nullable()->after('id');
            // We won't add a strict foreign key constraint yet to avoid errors if some GNs don't exist.
            // $table->foreign('gn_id')->references('id')->on('grama_niladharis')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('housing_ownership_statuses', function (Blueprint $table) {
            $table->dropColumn('gn_id');
        });
    }
};
