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
                    'first_name' => $firstName,
                    'last_name' => $lastName,
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
