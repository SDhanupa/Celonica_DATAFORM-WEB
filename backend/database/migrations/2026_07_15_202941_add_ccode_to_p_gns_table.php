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
            $table->string('CCODE')->nullable()->after('grama_niladhari_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('p_gns', function (Blueprint $table) {
            $table->dropColumn('CCODE');
        });
    }
};
