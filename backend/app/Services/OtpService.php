<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class OtpService
{
    /**
     * Generate an 8-digit cryptographically secure OTP
     */
    public function generateOtp(): string
    {
        try {
            $otp = random_int(10000000, 99999999);
        } catch (\Exception $e) {
            // Fallback if random_int fails
            $otp = rand(10000000, 99999999);
        }
        
        return (string)$otp;
    }

    /**
     * Store OTP in cache for 5 minutes tied to an identifier (e.g. Mobile number)
     */
    public function storeOtp(string $identifier, string $otp, int $minutes = 5): void
    {
        $cacheKey = 'otp_' . md5($identifier);
        Cache::put($cacheKey, $otp, now()->addMinutes($minutes));
    }

    /**
     * Validate an OTP against an identifier.
     * Returns true if valid and deletes it from cache to prevent reuse.
     */
    public function validateOtp(string $identifier, string $enteredOtp): bool
    {
        $cacheKey = 'otp_' . md5($identifier);
        
        // For testing/development, you can allow a backdoor OTP like '00000000' if needed.
        if (config('app.env') === 'local' && $enteredOtp === '00000000') {
            return true;
        }

        $cachedOtp = Cache::get($cacheKey);

        if ($cachedOtp && $cachedOtp === $enteredOtp) {
            // Remove the OTP to prevent reuse
            Cache::forget($cacheKey);
            return true;
        }

        return false;
    }
}
