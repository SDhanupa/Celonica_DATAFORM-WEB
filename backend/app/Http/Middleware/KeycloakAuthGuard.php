<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Models\User;
use App\Services\KeycloakTokenVerifier;
use Closure;
use Illuminate\Http\Request;

class KeycloakAuthGuard
{
    public function __construct(private KeycloakTokenVerifier $verifier)
    {
    }

    /**
     * 1. Discard any client-supplied identity keys
     * 2. Verify the Bearer token against Keycloak
     * 3. Resolve the caller as an admin, a user, or someone still onboarding
     * 4. Publish the identity on the request
     *
     * Identity is written to request attributes (not client-controllable) and is
     * also merged into input, because existing resolvers read it via
     * `$request->get()` / `$request->input()`. Step 1 is what makes the merged
     * copy trustworthy: after it, those keys can only hold server-set values.
     */
    public function handle(Request $request, Closure $next)
    {
        StripClientIdentityKeys::strip($request);

        $token = KeycloakTokenVerifier::bearerToken($request);

        if (!$token) {
            return response()->json(['error' => 'Unauthorized: Token required'], 401);
        }

        if (KeycloakTokenVerifier::isGuestToken($token)) {
            $this->publish($request, ['is_guest' => true]);
            return $next($request);
        }

        try {
            $decoded = $this->verifier->verify($token);
        } catch (\Throwable $e) {
            error_log('[KeycloakAuthGuard] token rejected: ' . $e->getMessage());
            return response()->json(['error' => 'Unauthorized: ' . $e->getMessage()], 401);
        }

        $sub = $decoded->sub;
        $claims = [
            'keycloak_sub' => $sub,
            'keycloak_first_name' => $decoded->given_name ?? null,
            'keycloak_last_name' => $decoded->family_name ?? null,
        ];

        try {
            $admin = Admin::findByKeycloakSub($sub);
            if ($admin) {
                if (!$admin->is_active) {
                    return response()->json(['error' => 'Forbidden: Admin account is deactivated'], 403);
                }
                $admin->update(['last_login_at' => now()]);
                $this->publish($request, $claims + [
                    'current_admin' => $admin,
                    'keycloak_email' => $decoded->email ?? $admin->email,
                ]);
                return $next($request);
            }

            $user = User::where('keycloak_sub', $sub)->first();
            if ($user) {
                $this->publish($request, $claims + [
                    'current_user' => $user,
                    'keycloak_email' => $decoded->email ?? $user->email,
                ]);
                return $next($request);
            }

            $this->publish($request, $claims + [
                'needs_onboarding' => true,
                'keycloak_email' => $decoded->email ?? null,
            ]);
            return $next($request);
        } catch (\Throwable $e) {
            error_log('[KeycloakAuthGuard] DB lookup failed: ' . $e->getMessage());
            return response()->json(['error' => 'Server error during authentication'], 500);
        }
    }

    private function publish(Request $request, array $identity): void
    {
        foreach ($identity as $key => $value) {
            $request->attributes->set($key, $value);
        }
        $request->merge($identity);
    }
}
