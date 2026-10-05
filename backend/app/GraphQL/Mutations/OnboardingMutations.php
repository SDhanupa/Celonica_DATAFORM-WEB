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
    public function completeUserOnboarding($_, array $args)
    {
        $request = request();
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
                // Insert new user using Eloquent so HasUuids generates an ID
                User::create([
                    'name' => $firstName . ' ' . $lastName,
                    'email' => $email,
                    'password' => bcrypt(Str::random(16)),
                    'nic' => $nic,
                    'mobile_number' => $mobileNumber,
                    'address' => $address,
                    'dob' => $dob,
                    'gender' => $gender,
                    'keycloak_sub' => $sub,
                ]);
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Onboarding Failed: ' . $e->getMessage());
            if (str_contains($e->getMessage(), 'users_nic_unique')) {
                throw new \GraphQL\Error\Error('This NIC number is already registered to another account.');
            }
            if (str_contains($e->getMessage(), 'users_mobile_number_unique') || str_contains($e->getMessage(), 'users_mobile_unique')) {
                throw new \GraphQL\Error\Error('This Mobile Number is already registered to another account.');
            }
            throw new \GraphQL\Error\Error('Failed to complete onboarding: ' . $e->getMessage());
        }
    }
}
