<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    /**
     * Reads the admin from request attributes, which only KeycloakAuthGuard can
     * set. Checking `$request->current_admin` read the input bag instead, where a
     * client-sent `?current_admin=1` was truthy enough to pass.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->attributes->get('current_admin');

        if (!$admin instanceof Admin || !$admin->is_active) {
            return response()->json(['error' => 'Super Admin access required'], 403);
        }

        return $next($request);
    }
}
