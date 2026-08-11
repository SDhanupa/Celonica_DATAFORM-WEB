<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Models\User;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class KeycloakAuthGuard
{
    /**
     * Handle an incoming request.
     * 1. Extract Bearer token from Authorization header
     * 2. Fetch Keycloak JWKS and verify JWT signature
     * 3. Look up the user in admins or users table
     * 4. Attach to request, or flag for onboarding
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $this->extractToken($request);

        if (!$token) {
            // Reject any request without a token to prevent brute forcing
            return response()->json(['error' => 'Unauthorized: Token required'], 401);
        }

        // Check if it's a valid guest token
        if (\Illuminate\Support\Facades\Cache::has('guest_token_' . $token)) {
            $request->merge(['is_guest' => true]);
            return $next($request);
        }

        try {
            $decoded = $this->decodeToken($token);
        } catch (\Throwable $e) {
            error_log('[KeycloakAuthGuard] decodeToken failed: ' . $e->getMessage());
            return response()->json(['error' => 'Unauthorized: ' . $e->getMessage()], 401);
        }

        $sub = $decoded->sub ?? null;

        if (!$sub) {
            error_log('[KeycloakAuthGuard] Token has no sub claim');
            return response()->json(['error' => 'Unauthorized: Invalid token payload'], 401);
        }

        error_log('[KeycloakAuthGuard] Looking up sub: ' . $sub);

        try {
            // 1. Check Admins
            $admin = Admin::findByKeycloakSub($sub);
            if ($admin) {
                error_log('[KeycloakAuthGuard] Found admin: ' . $admin->email);
                if (!$admin->is_active) {
                    return response()->json(['error' => 'Forbidden: Admin account is deactivated'], 403);
                }
                $admin->update(['last_login_at' => now()]);
                $request->merge([
                    'current_admin' => $admin,
                    'keycloak_sub' => $sub,
                    'keycloak_email' => $decoded->email ?? $admin->email,
                    'keycloak_first_name' => $decoded->given_name ?? null,
                    'keycloak_last_name' => $decoded->family_name ?? null,
                ]);
                return $next($request);
            }

            // 2. Check Users
            $user = User::where('keycloak_sub', $sub)->first();
            if ($user) {
                error_log('[KeycloakAuthGuard] Found user: ' . $user->email);
                $request->merge([
                    'current_user' => $user,
                    'keycloak_sub' => $sub,
                    'keycloak_email' => $decoded->email ?? $user->email,
                    'keycloak_first_name' => $decoded->given_name ?? null,
                    'keycloak_last_name' => $decoded->family_name ?? null,
                ]);
                return $next($request);
            }

            // 3. User not in DB (Needs Onboarding)
            error_log('[KeycloakAuthGuard] User not found in DB — needs onboarding');
            $request->merge([
                'needs_onboarding' => true,
                'keycloak_sub' => $sub,
                'keycloak_email' => $decoded->email ?? null,
                'keycloak_first_name' => $decoded->given_name ?? null,
                'keycloak_last_name' => $decoded->family_name ?? null,
            ]);

            return $next($request);

        } catch (\Throwable $e) {
            error_log('[KeycloakAuthGuard] DB lookup failed: ' . $e->getMessage() . ' | ' . $e->getTraceAsString());
            return response()->json(['error' => 'Server error during authentication'], 500);
        }
    }

    /**
     * Extract Bearer token from Authorization header
     */
    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization', '');
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }

    /**
     * Decode and verify the Keycloak JWT using JWKS
     */
    private function decodeToken(string $token): object
    {
        $jwks = $this->getJwks();
        $keys = JWK::parseKeySet($jwks);
        $decoded = JWT::decode($token, $keys);

        // Validate issuer — use the public URL (what browser sees), not internal Docker URL
        $expectedIssuer = config('keycloak.public_url') . '/realms/' . config('keycloak.realm');
        if (($decoded->iss ?? '') !== $expectedIssuer) {
            throw new \Exception('Invalid token issuer');
        }

        return $decoded;
    }

    /**
     * Fetch and cache Keycloak JWKS (public keys) for 1 hour
     */
    private function getJwks(): array
    {
        return Cache::remember('keycloak_jwks', 3600, function () {
            $url    = config('keycloak.jwks_url');
            $response = Http::timeout(10)->get($url);

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch Keycloak public keys');
            }

            return $response->json();
        });
    }
}
