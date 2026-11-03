<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use GraphQL\Error\Error;

class OtpService
{
    public function generateOtp(): string
    {
        return (string) random_int(10000000, 99999999);
    }

    /** Shared across registration/login and alternate phone formatting. */
    public function reserveSend(string $identifier, string $mobile): void
    {
        $digits = preg_replace('/\D/', '', $mobile);
        if (str_starts_with($digits, '0094')) $digits = substr($digits, 2);
        if (str_starts_with($digits, '0')) $digits = '94' . substr($digits, 1);
        $destination = 'otp-send:' . hash('sha256', $digits);
        $account = 'otp-account:' . hash('sha256', strtolower(trim($identifier)));
        Cache::lock($destination . ':lock', 5)->block(2, function () use ($destination, $account) {
            if (RateLimiter::tooManyAttempts($destination, 5)
                || RateLimiter::tooManyAttempts($account, 5)
                || !Cache::add($destination . ':cooldown', true, 60)) {
                throw new Error('Please wait before requesting another code.');
            }
            RateLimiter::hit($destination, 3600);
            RateLimiter::hit($account, 3600);
        });
    }

    public function storeOtp(string $identifier, string $otp, int $minutes = 5): void
    {
        Cache::put('otp_' . md5($identifier), hash('sha256', $otp), now()->addMinutes($minutes));
    }

    /** Five guesses per identifier in five minutes; success consumes the code. */
    public function validateOtp(string $identifier, string $enteredOtp): bool
    {
        $key = 'otp_' . md5($identifier);
        return Cache::lock($key . ':lock', 5)->block(2, function () use ($key, $enteredOtp) {
            $attempts = $key . ':attempts';
            if (RateLimiter::tooManyAttempts($attempts, 5)) {
                Cache::forget($key);
                return false;
            }
            RateLimiter::hit($attempts, 300);
            $hash = Cache::get($key);
            if (is_string($hash) && hash_equals($hash, hash('sha256', $enteredOtp))) {
                Cache::forget($key);
                RateLimiter::clear($attempts);
                return true;
            }
            if (RateLimiter::tooManyAttempts($attempts, 5)) Cache::forget($key);
            return false;
        });
    }
}
