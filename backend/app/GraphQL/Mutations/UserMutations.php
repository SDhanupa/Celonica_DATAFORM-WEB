<?php

namespace App\GraphQL\Mutations;

use App\Services\KeycloakAdminService;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class UserMutations
{
    protected $keycloakAdminService;

    public function __construct(KeycloakAdminService $keycloakAdminService)
    {
        $this->keycloakAdminService = $keycloakAdminService;
    }

    /**
     * @param  null  $_
     * @param  array<string, mixed>  $args
     */
    public function syncUser($_, array $args)
    {
        $request = request();
        $sub = $request->get('keycloak_sub');
        $user = $request->get('current_user');
        $admin = $request->get('current_admin');

        Log::info('syncUser called', ['sub' => $sub, 'user_exists' => !!$user, 'admin_exists' => !!$admin]);

        // If KeycloakAuthGuard already matched a user, return it
        if ($user) {
            return $user;
        }

        if ($admin) {
            $existingUser = User::where('keycloak_sub', $admin->keycloak_sub)->orWhere('email', $admin->email)->first();
            if ($existingUser) {
                return $existingUser;
            }
            return User::create([
                'name' => $admin->name ?? 'Admin User',
                'email' => $admin->email,
                'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                'keycloak_sub' => $admin->keycloak_sub,
            ]);
        }

        if (!$sub) {
            throw new Exception('Unauthorized or no valid Keycloak token provided.');
        }

        $email = $request->get('keycloak_email');
        if (!$email) {
            // Fallback email if Keycloak didn't include email claim
            $email = "user_{$sub}@celonica.local";
        }

        $firstName = $request->get('keycloak_first_name') ?? 'User';
        $lastName = $request->get('keycloak_last_name') ?? '';

        $newUser = User::updateOrCreate(
            ['keycloak_sub' => $sub],
            [
                'email' => $email,
                'name' => trim("$firstName $lastName"),
                'password' => bcrypt(\Illuminate\Support\Str::random(16)),
            ]
        );

        return $newUser;
    }

    /**
     * @param  null  $_
     * @param  array<string, mixed>  $args
     */
    public function registerUser($_, array $args)
    {
        // 1. Authorization check: Only SUPER_ADMIN can do this
        $authUser = auth()->user();
        if (!$authUser || $authUser->role !== 'super_admin') {
            throw new Exception('Unauthorized. Only Super Admins can register users.');
        }

        $email = $args['email'];
        $firstName = $args['firstName'];
        $lastName = $args['lastName'];
        $nic = $args['nic'] ?? null;
        $password = $args['password'];
        $mobileNumber = $args['mobileNumber'] ?? null;
        $role = $args['role']; // USER, ADMIN, SUPER_ADMIN

        DB::beginTransaction();
        try {
            // 2. Create User in Keycloak
            $keycloakSub = $this->keycloakAdminService->createUser([
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
            ], $password);

            // 3. Store in corresponding table
            if ($role === 'USER') {
                DB::table('users')->insert([
                    'name' => $firstName . ' ' . $lastName,
                    'email' => $email,
                    'password' => bcrypt($password), // Fallback local password
                    'nic' => $nic,
                    'mobile_number' => $mobileNumber,
                    'keycloak_sub' => $keycloakSub,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                // ADMIN or SUPER_ADMIN
                $adminRole = strtolower($role);
                DB::table('admins')->insert([
                    'name' => $firstName . ' ' . $lastName,
                    'email' => $email,
                    'keycloak_sub' => $keycloakSub,
                    'role' => $adminRole,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Registration Failed: ' . $e->getMessage());
            throw new Exception('Failed to register user: ' . $e->getMessage());
        }
    }

    /**
     * @param  null  $_
     * @param  array<string, mixed>  $args
     */
    public function updateUserProfile($_, array $args)
    {
        $user = request()->get('current_user') ?? request()->get('current_admin');
        
        if (!$user) {
            throw new \Exception('Unauthenticated.');
        }

        $updateData = [];
        if (isset($args['nic'])) $updateData['nic'] = $args['nic'];
        if (isset($args['mobileNumber'])) $updateData['mobile_number'] = $args['mobileNumber'];
        if (isset($args['address'])) $updateData['address'] = $args['address'];
        if (isset($args['dob'])) $updateData['dob'] = $args['dob'];
        if (isset($args['gender'])) $updateData['gender'] = $args['gender'];

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        return $user;
    }
}
