<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'mobile' => 'required|string',
        ]);

        $mobile = $request->mobile;

        // Generate a 100-character secure seed as requested
        $secureSeed = Str::random(100);
        
        // Calculate a 6-digit code from the 100-character secure seed
        // We hash it to ensure even distribution and extract the first 6 digits
        $hash = hash('sha256', $secureSeed);
        $numericHash = preg_replace("/[^0-9]/", "", $hash);
        
        // Fallback to random_int if the hash doesn't have 6 digits (highly unlikely)
        $otp = strlen($numericHash) >= 6 ? substr($numericHash, 0, 6) : (string) random_int(100000, 999999);

        // Store the OTP securely in the server cache for 5 minutes
        Cache::put('otp_' . $mobile, $otp, now()->addMinutes(5));

        // Prepare the SMS message
        $message = "Your Ceylonica Industry Survey verification code is: {$otp}. Please do not share this code.";

        try {
            // Send the SMS via TextWare API
            $response = Http::get(env('TEXTWARE_API_URL'), [
                'username' => env('TEXTWARE_USERNAME'),
                'password' => env('TEXTWARE_PASSWORD'),
                'src' => env('TEXTWARE_SENDER_ID'),
                'dst' => $mobile,
                'msg' => $message,
                'dr' => 1
            ]);

            Log::info("OTP sent to {$mobile}. API Response: " . $response->body());

            return response()->json(['success' => true, 'message' => 'OTP sent successfully']);
        } catch (\Exception $e) {
            Log::error("Failed to send SMS to {$mobile}: " . $e->getMessage());
            // Even if SMS fails (e.g. invalid credentials in dev), we return success in non-production or log it
            return response()->json(['success' => false, 'error' => 'Failed to send SMS'], 500);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'mobile' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $mobile = $request->mobile;
        $userCode = $request->code;

        $cachedCode = Cache::get('otp_' . $mobile);

        if (!$cachedCode) {
            return response()->json(['success' => false, 'error' => 'OTP expired or not requested'], 400);
        }

        if ($cachedCode === $userCode) {
            // OTP matches, clear from cache
            Cache::forget('otp_' . $mobile);
            return response()->json(['success' => true, 'message' => 'Verified successfully']);
        }

        return response()->json(['success' => false, 'error' => 'Invalid OTP'], 400);
    }
}
