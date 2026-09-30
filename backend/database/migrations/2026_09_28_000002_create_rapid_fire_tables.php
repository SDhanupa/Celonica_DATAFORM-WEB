<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapid_fire_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('contributor_sub');
            $table->string('ccode', 32);
            $table->string('deck', 120);
            // The exact topics issued, in order. Answers are only accepted for these.
            $table->json('topic_ids');
            // Topics already resolved in this round (answered or skipped), so a
            // card can be played exactly once.
            $table->json('resolved_ids');
            $table->unsignedInteger('score')->default(0);
            $table->unsignedSmallInteger('current_streak')->default(0);
            $table->unsignedSmallInteger('best_streak')->default(0);
            $table->timestamp('last_answer_at', 3)->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['contributor_sub', 'created_at'], 'rfs_contributor_idx');
        });

        Schema::create('village_topic_answers', function (Blueprint $table) {
            $table->id();
            $table->string('ccode', 32);
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('contributor_sub');
            $table->string('answer', 8); // yes | no | unsure
            $table->unsignedInteger('response_ms')->nullable();
            $table->boolean('is_hasty')->default(false);
            $table->uuid('session_id')->nullable();
            $table->unsignedSmallInteger('points')->default(0);
            $table->timestamps();

            // One current answer per person, per topic, per village.
            $table->unique(['ccode', 'category_id', 'contributor_sub'], 'vta_one_answer_per_person');
            $table->index(['ccode', 'category_id'], 'vta_village_topic_idx');
            $table->index('session_id', 'vta_session_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('village_topic_answers');
        Schema::dropIfExists('rapid_fire_sessions');
    }
};
