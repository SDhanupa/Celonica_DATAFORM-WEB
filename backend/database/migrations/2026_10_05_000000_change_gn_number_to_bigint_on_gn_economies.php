<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * gn_economies.gn_number is joined against grama_niladharis.id (bigint) by
     * GramaNiladhari::gnEconomy(). PostgreSQL rejects varchar = integer, which
     * broke the GetPDistrictWithGns query (and therefore the GN dropdown).
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE gn_economies ALTER COLUMN gn_number TYPE bigint USING NULLIF(TRIM(gn_number), '')::bigint");
        } else {
            DB::statement('ALTER TABLE gn_economies MODIFY gn_number BIGINT UNSIGNED NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE gn_economies ALTER COLUMN gn_number TYPE varchar(255) USING gn_number::varchar');
        } else {
            DB::statement('ALTER TABLE gn_economies MODIFY gn_number VARCHAR(255) NULL');
        }
    }
};
