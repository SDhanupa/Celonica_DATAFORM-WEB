<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('location_api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('token_hash', 64)->unique();
            $table->string('prefix', 20);
            $table->string('scope', 30)->default('gn:read');
            $table->string('created_by', 100);
            $table->timestampTz('expires_at');
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampTz('last_used_at')->nullable();
            $table->unsignedBigInteger('request_count')->default(0);
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_api_keys');
    }
};
