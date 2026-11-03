<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class GraphqlRequestBudget
{
    public function handle(Request $request, Closure $next)
    {
        // Apply before authentication and parsing, including guest requests.
        $key = 'graphql:' . hash('sha256', (string) $request->ip());
        if (!RateLimiter::attempt($key, 120, fn () => true, 60)) {
            return response()->json(['errors' => [['message' => 'Too many requests. Please try again shortly.']]], 429)
                ->header('Retry-After', (string) RateLimiter::availableIn($key));
        }
        $body = $request->getContent();
        if (strlen($body) > 65536 || str_starts_with(ltrim($body), '[')) {
            return response()->json(['errors' => [['message' => 'Send one GraphQL operation per request (maximum 64 KB).']]], 400);
        }
        return $next($request);
    }
}
