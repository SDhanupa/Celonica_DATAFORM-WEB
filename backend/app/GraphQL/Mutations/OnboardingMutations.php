<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class OnboardingMutations
{
    /**
     * @param  null  $_
     * @param  array<string, mixed>  $args
     */
    public function completeUserOnboarding($_, array $args, array $context)
    {
        $request = $context['request'] ?? request();
        $sub = $request->get('keycloak_sub');

        if (!$sub) {
            throw new Exception('Unauthorized or no valid Keycloak token provided.');
        }

        $email = $request->get('keycloak_email');
        if (!$email) {
            throw new Exception('Email not found in Keycloak token.');
        }

        $firstName = $args['firstName'];
        $lastName = $args['lastName'];
        $nic = $args['nic'];
        $mobileNumber = $args['mobileNumber'];
        $address = $args['address'];
        $dob = $args['dob'];
        $gender = $args['gender'];

        DB::beginTransaction();
        try {
            $user = User::where('keycloak_sub', $sub)->first();
            if ($user) {
                // Update existing user
                $user->update([
                    'nic' => $nic,
                    'mobile_number' => $mobileNumber,
                    'address' => $address,
                    'dob' => $dob,
                    'gender' => $gender,
                ]);
            } else {
                // Insert new user
                DB::table('users')->insert([
                    'name' => trim("$firstName $lastName"),
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'password' => bcrypt(Str::random(16)),
                    'nic' => $nic,
                    'mobile_number' => $mobileNumber,
                    'address' => $address,
                    'dob' => $dob,
                    'gender' => $gender,
                    'keycloak_sub' => $sub,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Onboarding Failed: ' . $e->getMessage());
            throw new Exception('Failed to complete onboarding: ' . $e->getMessage());
        }
    }
}
