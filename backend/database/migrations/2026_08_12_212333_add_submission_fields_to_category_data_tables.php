<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'category_data_%'");
        
        foreach ($tables as $table) {
            $tableName = $table->tablename;
            Schema::table($tableName, function (Blueprint $table) {
                if (!Schema::hasColumn($table->getTable(), 'added_by_user_id')) {
                    $table->unsignedBigInteger('added_by_user_id')->nullable();
                }
                if (!Schema::hasColumn($table->getTable(), 'is_approved')) {
                    $table->boolean('is_approved')->default(true);
                }
                if (!Schema::hasColumn($table->getTable(), 'coordinate_mismatch')) {
                    $table->boolean('coordinate_mismatch')->default(false);
                }
                if (!Schema::hasColumn($table->getTable(), 'is_update_proposal')) {
                    $table->boolean('is_update_proposal')->default(false);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'category_data_%'");
        
        foreach ($tables as $table) {
            $tableName = $table->tablename;
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['added_by_user_id', 'is_approved', 'coordinate_mismatch', 'is_update_proposal']);
            });
        }
    }
};
