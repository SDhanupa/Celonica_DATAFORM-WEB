<?php

namespace App\Http\Middleware;

use App\Services\KeycloakTokenVerifier;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * For public endpoints that anyone may use but that should credit a signed-in
 * caller. No token (or a guest token) proceeds anonymously; a verified token
 * sets the `keycloak_sub` request attribute.
 *
 * A token that is present but invalid is rejected rather than downgraded to
 * anonymous: the caller believes they are signed in, and silently dropping
 * their attribution would lose credit for work they think is theirs.
 */
class OptionalKeycloakAuth
{
    public function __construct(private KeycloakTokenVerifier $verifier)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        StripClientIdentityKeys::strip($request);

        $token = KeycloakTokenVerifier::bearerToken($request);

        if (!$token || KeycloakTokenVerifier::isGuestToken($token)) {
            return $next($request);
        }

        try {
            $decoded = $this->verifier->verify($token);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Your session has expired. Please sign in again.',
            ], 401);
        }

        $request->attributes->set('keycloak_sub', $decoded->sub);

        return $next($request);
    }
}
