<?php

namespace App\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Verifies Keycloak access tokens against the realm's published keys. Shared by
 * the mandatory guard and the optional one so both apply identical rules.
 */
class KeycloakTokenVerifier
{
    public static function bearerToken(Request $request): ?string
    {
        $header = (string) $request->header('Authorization', '');

        return str_starts_with($header, 'Bearer ') ? substr($header, 7) : null;
    }

    public static function isGuestToken(string $token): bool
    {
        return Cache::has('guest_token_' . $token);
    }

    /**
     * @throws \Throwable when the signature, expiry or issuer is invalid
     */
    public function verify(string $token): object
    {
        $decoded = JWT::decode($token, JWK::parseKeySet($this->jwks()));

        // The public URL is what the browser authenticated against, not the
        // internal Docker hostname the backend uses to fetch keys.
        $expectedIssuer = config('keycloak.public_url') . '/realms/' . config('keycloak.realm');
        if (($decoded->iss ?? '') !== $expectedIssuer) {
            throw new RuntimeException('Invalid token issuer');
        }

        if (empty($decoded->sub)) {
            throw new RuntimeException('Token has no subject');
        }

        return $decoded;
    }

    private function jwks(): array
    {
        try {
            return Cache::remember('keycloak_jwks', 3600, function () {
                $response = Http::timeout(3)->get(config('keycloak.jwks_url'));

                if (!$response->successful()) {
                    throw new RuntimeException('Failed to fetch Keycloak public keys');
                }

                return $response->json();
            });
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException|\Psr\SimpleCache\InvalidArgumentException $e) {
            // Cache write failed — fetch fresh without caching.
            $response = Http::timeout(3)->get(config('keycloak.jwks_url'));
            if (!$response->successful()) {
                throw new RuntimeException('Failed to fetch Keycloak public keys');
            }
            return $response->json();
        }
    }
}
