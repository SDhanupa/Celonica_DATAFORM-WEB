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
        $this->username = config('services.textware.username');
        $this->password = config('services.textware.password');
        $this->senderId = config('services.textware.sender_id');
    }

    /**
     * Send SMS via TextWare API
     */
    public function sendSms(string $phoneNumber, string $message): bool
    {
        // Never log login codes or report an unsent code as delivered.
        if (empty($this->password)) {
            Log::warning('SMS gateway is not configured.');
            return false;
        }

        try {
            $response = Http::timeout(10)->get(config('services.textware.api_url') ?: 'https://msg.text-ware.com/send_sms.php', [
                'username' => $this->username,
                'password' => $this->password,
                'src'      => $this->senderId,
                'dst'      => $phoneNumber,
                'msg'      => $message,
                'dr'       => 1
            ]);

            if ($response->successful()) {
                Log::info('SMS gateway accepted a message.');
                return true;
            } else {
                Log::error('SMS gateway rejected a message.', ['status' => $response->status()]);
                return false;
            }
        } catch (Exception $e) {
            Log::error('SMS gateway request failed.', ['exception' => get_class($e)]);
            return false;
        }
    }
}
