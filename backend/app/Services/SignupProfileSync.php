<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class SignupProfileSync
{
    public function __construct(private KeycloakAdminService $keycloak) {}

    public function sync(string $subject): User
    {
        $existing = User::where('keycloak_sub', $subject)->first();
        if ($existing && !empty($existing->nic) && !empty($existing->mobile_number)) {
            return $existing;
        }

        try {
            return $this->syncProfile($subject);
        } catch (\Throwable $error) {
            if (!$existing) throw $error;

            // An established account must not lose access because optional
            // enrichment is unavailable or conflicts with another user's data.
            // syncProfile's transaction has already rolled back any failed write.
            Log::warning('Signup profile enrichment deferred', ['exception' => get_class($error)]);
            return $existing;
        }
    }

    private function syncProfile(string $subject): User
    {
        $profile = $this->keycloak->getUserProfile($subject);
        $attributes = $profile['attributes'] ?? [];
        $nic = $this->attribute($attributes, 'NIC') ?? $this->attribute($attributes, 'nic');
        $mobile = $this->attribute($attributes, 'mobile_number');

        // Keep missing values missing. Never manufacture identity/contact data.
        $signup = ['nic' => $nic, 'mobile_number' => $mobile];

        return DB::transaction(function () use ($subject, $profile, $signup) {
            $user = User::where('keycloak_sub', $subject)->lockForUpdate()->first();
            if ($user) {
                $missing = [];
                foreach ($signup as $field => $value) {
                    if (empty($user->$field) && $value !== null) $missing[$field] = $value;
                }
                if ($missing) $user->update($missing);
                return $user;
            }

            $email = trim($profile['email'] ?? '');
            if ($email === '' || User::where('email', $email)->exists()) {
                // Email alone must never link or overwrite another account.
                throw new RuntimeException('Unable to link this signup profile. Contact support.');
            }
            $name = trim(($profile['firstName'] ?? '') . ' ' . ($profile['lastName'] ?? ''));
            if ($name === '') {
                throw new RuntimeException('Signup names are unavailable. Check the identity provider profile permissions.');
            }

            return User::create($signup + [
                'name' => $name,
                'email' => $email,
                'password' => bcrypt(Str::random(32)),
                'keycloak_sub' => $subject,
            ]);
        });
    }

    private function attribute(array $attributes, string $name): ?string
    {
        $value = $attributes[$name] ?? null;
        if (is_array($value)) $value = $value[0] ?? null;
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }
}
