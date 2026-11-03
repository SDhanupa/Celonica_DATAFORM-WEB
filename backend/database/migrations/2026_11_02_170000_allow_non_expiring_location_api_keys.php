<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('location_api_keys', fn (Blueprint $table) => $table->timestampTz('expires_at')->nullable()->change());
    }

    public function down(): void
    {
        // Never invent an expiration date or discard existing permanent keys on rollback.
        if (DB::table('location_api_keys')->whereNull('expires_at')->exists()) {
            throw new RuntimeException('Set explicit expiry dates for non-expiring keys before rolling back this migration.');
        }
        Schema::table('location_api_keys', fn (Blueprint $table) => $table->timestampTz('expires_at')->nullable(false)->change());
    }
};
