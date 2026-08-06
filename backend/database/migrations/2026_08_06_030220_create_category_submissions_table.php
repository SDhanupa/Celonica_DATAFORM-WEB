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
        Schema::create('category_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Location metadata
            $table->string('district')->nullable();
            $table->string('ds_division')->nullable();
            $table->string('gn_name')->nullable();
            $table->string('gn_code')->nullable();
            
            // GPS coordinates
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Generated item code (e.g., Pahalagama/RATPA/SAPDSGV/1)
            $table->string('generated_code')->nullable();
            
            // The JSON blob containing user answers
            $table->json('answers_data')->nullable();
            
            // Approval status (pending, approved, rejected)
            $table->string('status')->default('pending');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_submissions');
    }
};
