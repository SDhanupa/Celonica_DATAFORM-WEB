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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'keycloak_sub')) {
                $table->string('keycloak_sub')->unique()->nullable()->after('id')->comment('Keycloak user subject ID');
            }
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('users', 'nic')) {
                $table->string('nic')->unique()->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('users', 'mobile_number')) {
                $table->string('mobile_number')->nullable()->after('nic');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['keycloak_sub', 'first_name', 'last_name', 'nic', 'mobile_number']);
        });
    }
};
