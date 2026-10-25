<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('village_topic_answers', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->nullable()->after('answer');
        });
    }

    public function down(): void
    {
        Schema::table('village_topic_answers', function (Blueprint $table) {
            $table->dropColumn('quantity');
        });
    }
};
