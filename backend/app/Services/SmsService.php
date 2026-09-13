<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class SmsService
{
    protected $username;
    protected $password;
    protected $senderId;

    public function __construct()
    {
        $this->username = env('TEXTWARE_USERNAME', 'TW01176_vixva_tr');
        $this->password = env('TEXTWARE_PASSWORD', ''); 
        $this->senderId = env('TEXTWARE_SENDER_ID', 'VIXVA');
    }

    /**
     * Send SMS via TextWare API
     */
    public function sendSms(string $phoneNumber, string $message): bool
    {
        // If no password is provided in .env, simulate for local dev
        if (empty($this->password)) {
            Log::info("[SIMULATED SMS] to {$phoneNumber}: {$message}");
            return true;
        }

        try {
            $response = Http::get('https://msg.text-ware.com/send_sms.php', [
                'username' => $this->username,
                'password' => $this->password,
                'src'      => $this->senderId,
                'dst'      => $phoneNumber,
                'msg'      => $message,
                'dr'       => 1
            ]);

            if ($response->successful()) {
                Log::info("SMS sent to {$phoneNumber} via TextWare.");
                return true;
            } else {
                Log::error("TextWare SMS Error for {$phoneNumber}: HTTP " . $response->status());
                return false;
            }
        } catch (Exception $e) {
            Log::error("TextWare SMS Exception: " . $e->getMessage());
            return false;
        }
    }
}
