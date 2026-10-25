<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
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

            return User::create($signup + [
                'name' => trim(($profile['firstName'] ?? '') . ' ' . ($profile['lastName'] ?? '')),
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
