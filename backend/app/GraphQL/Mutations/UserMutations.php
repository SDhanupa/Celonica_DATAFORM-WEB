<?php

namespace App\GraphQL\Mutations;

use App\Services\KeycloakAdminService;
use App\Services\SignupProfileSync;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class UserMutations
{
    protected $keycloakAdminService;

    public function __construct(KeycloakAdminService $keycloakAdminService, private SignupProfileSync $signupProfiles)
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

            // Reuse signup data, filling only missing fields on this same identity.
            if ($user) {
                return $this->signupProfiles->sync($user->keycloak_sub);
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

            return $this->signupProfiles->sync($sub);
        } catch (\Throwable $e) {
            Log::error('Signup profile synchronization failed', ['exception' => get_class($e)]);
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
        $authUser = request()->get('current_admin');
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
        foreach (['address', 'dob', 'gender'] as $field) {
            if (array_key_exists($field, $args)) {
                $updateData[$field] = is_string($args[$field]) && trim($args[$field]) !== '' ? trim($args[$field]) : null;
            }
        }

        if (!empty($updateData)) {
            try {
                $user->update($updateData);
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'users_nic_unique')) {
                    throw new \Exception('This NIC number is already registered to another account.');
                }
                if (str_contains($e->getMessage(), 'users_mobile_number_unique') || str_contains($e->getMessage(), 'users_mobile_unique')) {
                    throw new \Exception('This Mobile Number is already registered to another account.');
                }
                throw $e;
            }
        }

        return $user;
    }
}
