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
            $table->foreignId('post_office_id')->nullable()->constrained('post_offices')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grama_niladharis', function (Blueprint $table) {
            $table->dropForeign(['post_office_id']);
            $table->dropColumn('post_office_id');
        });
    }
};
