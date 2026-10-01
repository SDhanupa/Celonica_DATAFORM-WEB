<?php

use App\Support\CategoryDataSchema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (CategoryDataSchema::allTables() as $table) {
            CategoryDataSchema::ensureContributorColumn($table);
        }

        // "My contributions" and village progress both look surveys up by owner
        // and by GN code.
        if (Schema::hasTable('industry_surveys')) {
            Schema::table('industry_surveys', function (Blueprint $t) {
                try {
                    $t->index('user_id', 'industry_surveys_user_id_idx');
                } catch (\Exception $e) {}
                try {
                    $t->index('ccode', 'industry_surveys_ccode_idx');
                } catch (\Exception $e) {}
            });
        }
    }

    public function down(): void
    {
        foreach (CategoryDataSchema::allTables() as $table) {
            if (Schema::hasColumn($table, 'contributor_sub')) {
                Schema::table($table, function (Blueprint $t) use ($table) {
                    $t->dropIndex('cd_' . substr(md5($table), 0, 16) . '_contrib_idx');
                    $t->dropColumn('contributor_sub');
                });
            }
        }

        if (Schema::hasTable('industry_surveys')) {
            Schema::table('industry_surveys', function (Blueprint $t) {
                $t->dropIndex('industry_surveys_user_id_idx');
                $t->dropIndex('industry_surveys_ccode_idx');
            });
        }
    }
};
