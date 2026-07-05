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
            $table->string('address')->nullable()->after('mobile_number');
            $table->date('dob')->nullable()->after('address');
            $table->string('gender')->nullable()->after('dob');

            // Modifying existing columns to be nullable (requires doctrine/dbal if older Laravel, but supported in Laravel 11 natively)
            $table->string('nic')->nullable()->change();
            $table->string('mobile_number')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['address', 'dob', 'gender']);
            $table->string('nic')->nullable(false)->change();
            $table->string('mobile_number')->nullable(false)->change();
        });
    }
};
