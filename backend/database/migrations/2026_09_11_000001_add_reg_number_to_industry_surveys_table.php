<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Registration numbers were previously stored only inside the `form_data` JSON
 * blob (`form_data.b_reg_no` or `form_data.formValues.b_reg_no`, depending on
 * which write path produced the row — see the 2026-09-11 form_data shape fix).
 * That made uniqueness a purely application-level, race-prone concept: two
 * concurrent submissions could compute the same "next" number before either
 * had written a row for the other to see.
 *
 * A real, indexed, UNIQUE column gives the database itself final authority: a
 * duplicate INSERT/UPDATE fails outright instead of silently succeeding, and
 * `IndustrySurveyController::store()` retries on that specific conflict. The
 * advisory lock added around generation is the *first* line of defense (avoids
 * the retry loop firing in the common case); this constraint is the one that
 * actually can't be raced.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('industry_surveys', function (Blueprint $table) {
            $table->string('reg_number')->nullable()->unique()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('industry_surveys', function (Blueprint $table) {
            $table->dropColumn('reg_number');
        });
    }
};
