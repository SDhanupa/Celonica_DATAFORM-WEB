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
                if (!Schema::hasColumn($table->getTable(), 'status')) {
                    $table->string('status', 50)->default('approved');
                }
            });

            // Map old is_approved values to status
            DB::statement("UPDATE {$tableName} SET status = 'approved' WHERE is_approved = true");
            DB::statement("UPDATE {$tableName} SET status = 'pending' WHERE is_approved = false");
        }
    }

    public function down(): void
    {
        $tables = DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'category_data_%'");
        
        foreach ($tables as $table) {
            $tableName = $table->tablename;
            Schema::table($tableName, function (Blueprint $table) {
                if (Schema::hasColumn($table->getTable(), 'status')) {
                    $table->dropColumn('status');
                }
            });
        }
    }
};
