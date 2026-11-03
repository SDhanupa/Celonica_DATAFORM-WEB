<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Apply CORS globally so GraphQL endpoint accepts cross-origin requests
        // Identity keys are stripped from every request, guarded or not, so a
        // client can never pre-seed `current_admin` / `keycloak_sub`.
        $middleware->use([
            \Illuminate\Http\Middleware\TrustProxies::class,
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\StripClientIdentityKeys::class,
        ]);

        // Only configured internal proxy networks may supply forwarding headers.
        $middleware->trustProxies(
            at: array_filter(explode(',', env('TRUSTED_PROXIES', '127.0.0.1,::1'))),
            headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR | \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO,
        );

        // Register Keycloak guard as a named alias for use on routes
        $middleware->alias([
            'keycloak.admin' => \App\Http\Middleware\KeycloakAuthGuard::class,
            'keycloak.optional' => \App\Http\Middleware\OptionalKeycloakAuth::class,
            'super_admin' => \App\Http\Middleware\SuperAdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
