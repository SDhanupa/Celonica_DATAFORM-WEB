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
            $table->string('keycloak_sub')->unique()->nullable()->after('id')->comment('Keycloak user subject ID');
            $table->string('first_name')->after('name');
            $table->string('last_name')->after('first_name');
            $table->string('nic')->unique()->after('last_name');
            $table->string('mobile_number')->after('nic');
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
