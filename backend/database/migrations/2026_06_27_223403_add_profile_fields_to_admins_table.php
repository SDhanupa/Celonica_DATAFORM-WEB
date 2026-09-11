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
            if (!Schema::hasColumn('admins', 'nic')) {
                $table->string('nic')->unique()->nullable()->after('name');
            }
            if (!Schema::hasColumn('admins', 'mobile_number')) {
                $table->string('mobile_number')->nullable()->after('nic');
            }
            if (!Schema::hasColumn('admins', 'address')) {
                $table->string('address')->nullable()->after('mobile_number');
            }
            if (!Schema::hasColumn('admins', 'dob')) {
                $table->date('dob')->nullable()->after('address');
            }
            if (!Schema::hasColumn('admins', 'gender')) {
                $table->string('gender')->nullable()->after('dob');
            }
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
