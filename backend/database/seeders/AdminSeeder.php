<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminSeeder extends Seeder
{
    /**
     * Seed the super admin account.
     *
     * The keycloak_sub here matches the 'superadmin' user that was
     * auto-imported into Keycloak from the realm JSON.
     *
     * To get the real sub after Keycloak starts:
     *   1. Login to http://localhost:8080/admin
     *   2. Go to celonica-admin > Users > superadmin > Details
     *   3. Copy the ID field and paste it as the keycloak_sub below
     */
    public function run(): void
    {
        DB::table('admins')->updateOrInsert(
            ['email' => 'superadmin@celonica.com'],
            [
                'keycloak_sub' => env('SUPER_ADMIN_KEYCLOAK_SUB', 'REPLACE_WITH_KEYCLOAK_USER_ID'),
                'email'        => 'superadmin@celonica.com',
                'name'         => 'Super Admin',
                'role'         => 'super_admin',
                'is_active'    => true,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]
        );

        $this->command->info('✅ Super Admin seeded into admins table.');
        $this->command->warn('⚠️  Remember to update the keycloak_sub with the real Keycloak user ID!');
        $this->command->line('   Go to: http://localhost:8080/admin → celonica-admin realm → Users → superadmin → Details → ID');
    }
}
