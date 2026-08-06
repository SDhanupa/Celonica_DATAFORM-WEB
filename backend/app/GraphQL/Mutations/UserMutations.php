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
        try {
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
                if (!empty($admin->keycloak_sub)) {
                    $existingUser = User::where('keycloak_sub', $admin->keycloak_sub)->first();
                    if ($existingUser) return $existingUser;
                }
                if (!empty($admin->email)) {
                    $existingUser = User::where('email', $admin->email)->first();
                    if ($existingUser) {
                        if (!empty($admin->keycloak_sub) && empty($existingUser->keycloak_sub)) {
                            $existingUser->update(['keycloak_sub' => $admin->keycloak_sub]);
                        }
                        return $existingUser;
                    }
                }
                return User::create([
                    'name' => $admin->name ?? 'Admin User',
                    'first_name' => $admin->first_name ?? ($admin->name ?? 'Admin'),
                    'last_name' => $admin->last_name ?? 'User',
                    'email' => $admin->email ?? ('admin_' . uniqid() . '@celonica.local'),
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                    'keycloak_sub' => $admin->keycloak_sub ?? null,
                    'nic' => null,
                    'mobile_number' => null,
                ]);
            }

            if (!$sub) {
                Log::warning('syncUser: no sub or user found, returning null');
                return null;
            }

            $email = $request->get('keycloak_email');
            if (!$email) {
                $email = "user_{$sub}@celonica.local";
            }

            $firstName = $request->get('keycloak_first_name') ?? 'User';
            $lastName = $request->get('keycloak_last_name') ?? '';

            $newUser = User::where('keycloak_sub', $sub)->first();
            if (!$newUser) {
                $newUser = User::where('email', $email)->first();
            }

            if ($newUser) {
                $newUser->update([
                    'name' => trim("$firstName $lastName"),
                    'keycloak_sub' => $sub,
                ]);
                return $newUser;
            }

            return User::create([
                'email' => $email,
                'name' => trim("$firstName $lastName"),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                'keycloak_sub' => $sub,
                'nic' => null,
                'mobile_number' => null,
            ]);
        } catch (\Throwable $e) {
            Log::error('syncUser error caught: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            // Return null safely - schema is now nullable (syncUser: User)
            return null;
        }
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
