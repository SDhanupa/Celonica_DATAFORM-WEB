<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class LocationApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');
        $token = $request->bearerToken();
        $key = is_string($token) && preg_match('/^cey_loc_[a-f0-9]{64}$/D', $token)
            ? DB::table('location_api_keys')->where('token_hash', hash('sha256', $token))
                ->whereNull('revoked_at')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->first() : null;
        if (!$key) return response()->json(['message' => 'A valid, unexpired API key is required.'], 401)
            ->header('WWW-Authenticate', 'Bearer')->header('Cache-Control', 'no-store');
        if ($key->scope !== 'gn:read') return response()->json(['message' => 'GN read access is required.'], 403);

        // Shared cache across API replicas. No coordinates, raw keys or personal data are logged.
        $bucket = 'location-api:key:' . $key->id;
        if (RateLimiter::tooManyAttempts($bucket, 60)) {
            return response()->json(['message' => 'Request limit reached. Try again shortly.'], 429)
                ->header('Retry-After', (string) RateLimiter::availableIn($bucket))
                ->header('Cache-Control', 'no-store');
        }
        RateLimiter::hit($bucket, 60);
        DB::table('location_api_keys')->where('id', $key->id)->update([
            'last_used_at' => now(), 'request_count' => DB::raw('request_count + 1'),
        ]);
        $response = $next($request);
        $response->headers->set('Cache-Control', 'private, no-store');
        $response->headers->set('X-RateLimit-Limit', '60');
        $response->headers->set('X-RateLimit-Remaining', (string) max(0, 60 - RateLimiter::attempts($bucket)));
        return $response;
    }
}
