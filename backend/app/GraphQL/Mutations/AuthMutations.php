<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Services\KeycloakAdminService;
use App\Services\OtpService;
use App\Services\SmsService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use GraphQL\Error\Error;
use Exception;

class AuthMutations
{
    protected $keycloakAdminService;
    protected $otpService;
    protected $smsService;

    public function __construct(KeycloakAdminService $keycloakAdminService, OtpService $otpService, SmsService $smsService)
    {
        $this->keycloakAdminService = $keycloakAdminService;
        $this->otpService = $otpService;
        $this->smsService = $smsService;
    }

    /**
     * Helper to mask a mobile number (e.g. 0771234567 -> 0xxxxxx4567)
     */
    protected function maskMobile(string $mobile): string
    {
        if (strlen($mobile) < 6) return $mobile;
        return substr($mobile, 0, 1) . str_repeat('x', strlen($mobile) - 5) . substr($mobile, -4);
    }

    public function initiateUserRegistration($rootValue, array $args)
    {
        $nic = $args['nic'];
        $mobile = $args['mobileNumber'];

        // Check if user already exists
        if (User::where('nic', $nic)->exists()) {
            throw new Error("A user with this NIC already exists.");
        }
        if (User::where('mobile_number', $mobile)->exists()) {
            throw new Error("A user with this mobile number already exists.");
        }

        // Cache registration payload temporarily (10 mins)
        Cache::put('reg_payload_' . md5($nic), $args, now()->addMinutes(10));

        // Generate and send OTP
        $otp = $this->otpService->generateOtp();
        $this->otpService->storeOtp('reg_' . $nic, $otp, 5);

        $message = "Your Ceylonica registration OTP is: {$otp}. Do not share this with anyone.";
        $this->smsService->sendSms($mobile, $message);

        return true;
    }

    public function verifyRegistrationOtp($rootValue, array $args)
    {
        $nic = $args['nic'];
        $otp = $args['otp'];

        if (!$this->otpService->validateOtp('reg_' . $nic, $otp)) {
            throw new Error("Invalid or expired OTP.");
        }

        $payload = Cache::get('reg_payload_' . md5($nic));
        if (!$payload) {
            throw new Error("Registration session expired. Please start over.");
        }

        // Create user
        $user = new User();
        $user->name = $payload['firstName'] . ' ' . $payload['lastName'];
        $user->first_name = $payload['firstName'];
        $user->last_name = $payload['lastName'];
        $user->email = strtolower($nic) . '@ceylonica.local'; // Dummy email for Keycloak requirement
        $user->nic = $nic;
        $user->mobile_number = $payload['mobileNumber'];
        $user->address = $payload['address'];
        $user->dob = $payload['dob'] ?? null;
        $user->gender = $payload['gender'] ?? null;
        
        // Save to generate ID
        $user->save();

        $kcPassword = $user->getProxyPassword();

        // Register in Keycloak
        try {
            $keycloakSub = $this->keycloakAdminService->createUser([
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
            ], $kcPassword);
            
            $user->keycloak_sub = $keycloakSub;
            $user->save();

        } catch (Exception $e) {
            Log::error("Failed to create user in Keycloak: " . $e->getMessage());
            $user->delete(); // Rollback
            throw new Error("Failed to register user account on the identity server.");
        }

        Cache::forget('reg_payload_' . md5($nic));

        // Fetch proxy token
        $tokenData = $this->keycloakAdminService->fetchUserToken($user->email, $kcPassword);
        return $tokenData['access_token'];
    }

    public function initiateUserLogin($rootValue, array $args)
    {
        $nic = $args['nic'];
        $user = User::where('nic', $nic)->first();

        if (!$user) {
            throw new Error("No account found with this NIC.");
        }

        return $this->maskMobile($user->mobile_number);
    }

    public function verifyLoginMobile($rootValue, array $args)
    {
        $nic = $args['nic'];
        $mobile = $args['mobileNumber'];

        $user = User::where('nic', $nic)->first();
        if (!$user) {
            throw new Error("User not found.");
        }

        if ($user->mobile_number !== $mobile) {
            throw new Error("Mobile number does not match our records.");
        }

        // Generate and send OTP
        $otp = $this->otpService->generateOtp();
        $this->otpService->storeOtp('login_' . $nic, $otp, 5);

        $message = "Your Ceylonica login OTP is: {$otp}. Do not share this with anyone.";
        $this->smsService->sendSms($mobile, $message);

        return true;
    }

    public function verifyLoginOtp($rootValue, array $args)
    {
        $nic = $args['nic'];
        $otp = $args['otp'];

        if (!$this->otpService->validateOtp('login_' . $nic, $otp)) {
            throw new Error("Invalid or expired OTP.");
        }

        $user = User::where('nic', $nic)->first();
        if (!$user) {
            throw new Error("User not found.");
        }

        $kcPassword = $user->getProxyPassword();

        try {
            $tokenData = $this->keycloakAdminService->fetchUserToken($user->email, $kcPassword);
            return $tokenData['access_token'];
        } catch (Exception $e) {
            Log::error("Failed to fetch proxy token for {$nic}: " . $e->getMessage());
            throw new Error("Authentication failed. Please contact support.");
        }
    }
}
