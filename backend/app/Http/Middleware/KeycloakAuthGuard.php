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
            $content = json_decode($request->getContent(), true) ?: [];
            $query = $content['query'] ?? '';

            // Allow any query to pass through (getting data out).
            // Block all mutations (putting data in) if no token is provided.
            if (preg_match('/^\s*mutation\b/i', $query)) {
                return response()->json(['error' => 'Unauthorized: Mutations require a token'], 401);
            }

            // For queries, proceed without injecting a user
            return $next($request);
        }

        try {
            $decoded = $this->decodeToken($token);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Unauthorized: ' . $e->getMessage()], 401);
        }

        $sub = $decoded->sub ?? null;

        if (!$sub) {
            return response()->json(['error' => 'Unauthorized: Invalid token payload'], 401);
        }

        // 1. Check Admins
        $admin = Admin::findByKeycloakSub($sub);
        if ($admin) {
            if (!$admin->is_active) {
                return response()->json(['error' => 'Forbidden: Admin account is deactivated'], 403);
            }
            $admin->update(['last_login_at' => now()]);
            $request->merge(['current_admin' => $admin]);
            return $next($request);
        }

        // 2. Check Users
        $user = User::where('keycloak_sub', $sub)->first();
        if ($user) {
            $request->merge(['current_user' => $user]);
            return $next($request);
        }

        // 3. User not in DB (Needs Onboarding)
        // We pass them through so they can hit the onboarding GraphQL mutation.
        // The individual GraphQL resolvers will block them from accessing sensitive data.
        $request->merge([
            'needs_onboarding' => true,
            'keycloak_sub' => $sub,
            'keycloak_email' => $decoded->email ?? null,
            'keycloak_first_name' => $decoded->given_name ?? null,
            'keycloak_last_name' => $decoded->family_name ?? null,
        ]);

        return $next($request);
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
