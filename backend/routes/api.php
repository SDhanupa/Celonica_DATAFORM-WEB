<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| The GraphQL endpoint is handled by Lighthouse via its own route.
| Additional REST-style API routes can be placed here.
|
*/

// Health check
Route::get('/health', fn() => response()->json(['status' => 'ok', 'service' => 'Celonica Admin API']));
