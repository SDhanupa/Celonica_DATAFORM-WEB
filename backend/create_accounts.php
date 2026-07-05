<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\KeycloakAdminService;
use Illuminate\Support\Facades\DB;

$service = app(KeycloakAdminService::class);

try {
    // 1. Create Admin
    $adminSub = $service->createUser([
        'email' => 'admin@celonica.com',
        'firstName' => 'Regular',
        'lastName' => 'Admin'
    ], 'Password@123');

    DB::table('admins')->insert([
        'name' => 'Regular Admin',
        'email' => 'admin@celonica.com',
        'keycloak_sub' => $adminSub,
        'role' => 'admin',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "Created admin: admin@celonica.com (pass: Password@123)\n";

    // 2. Create User
    $userSub = $service->createUser([
        'email' => 'user@celonica.com',
        'firstName' => 'Test',
        'lastName' => 'User'
    ], 'Password@123');

    DB::table('users')->insert([
        'name' => 'Test User',
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'user@celonica.com',
        'password' => bcrypt('Password@123'),
        'nic' => '123456789V',
        'mobile_number' => '+94770000000',
        'keycloak_sub' => $userSub,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "Created user: user@celonica.com (pass: password123)\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
