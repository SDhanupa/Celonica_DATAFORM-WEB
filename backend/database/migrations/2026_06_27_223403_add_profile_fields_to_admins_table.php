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
        Schema::table('admins', function (Blueprint $table) {
            $table->string('nic')->unique()->nullable()->after('name');
            $table->string('mobile_number')->nullable()->after('nic');
            $table->string('address')->nullable()->after('mobile_number');
            $table->date('dob')->nullable()->after('address');
            $table->string('gender')->nullable()->after('dob');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['nic', 'mobile_number', 'address', 'dob', 'gender']);
        });
    }
};
