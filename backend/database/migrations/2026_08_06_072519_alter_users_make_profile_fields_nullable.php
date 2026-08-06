<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Makes profile fields nullable on production DB so syncUser doesn't crash
     * when creating users without full profile data.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Make first_name nullable if column exists
            if (Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable()->change();
            }
            // Make last_name nullable if column exists
            if (Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->nullable()->change();
            }
            // Make nic nullable if column exists
            if (Schema::hasColumn('users', 'nic')) {
                $table->string('nic')->nullable()->change();
            }
            // Make mobile_number nullable if column exists
            if (Schema::hasColumn('users', 'mobile_number')) {
                $table->string('mobile_number')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We intentionally do not revert to NOT NULL as it would break existing null data
    }
};
