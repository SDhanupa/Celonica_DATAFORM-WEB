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

use App\Http\Controllers\ImageUploadController;

// Health check
Route::get('/health', fn() => response()->json(['status' => 'ok', 'service' => 'Ceylonica Admin API']));

// Public API Endpoints
Route::middleware('throttle:10,1')->get('/guest-token', function() {
    $token = bin2hex(random_bytes(32));
    \Illuminate\Support\Facades\Cache::put('guest_token_' . $token, true, now()->addHours(24));
    return response()->json(['token' => $token, 'expires_in' => 86400]);
});

Route::get('/category-data-tables', [\App\Http\Controllers\CategoryDataUploadController::class, 'getBulkDataCategories']);
Route::get('/category-data/{slug}', [\App\Http\Controllers\CategoryDataUploadController::class, 'getData']);
Route::get('/category-tables/{id}', [\App\Http\Controllers\CategoryTablesController::class, 'getTablesForCategory']);


// Secure Locations API
Route::middleware(['keycloak.admin'])->get('/locations', function () {
    $file = storage_path('app/locations.json');
    if (!file_exists($file)) abort(404);
    return response()->file($file, ['Content-Type' => 'application/json', 'Cache-Control' => 'public, max-age=3600']);
});

// Protected API Endpoints (Super Admin Only)
Route::middleware(['keycloak.admin', 'super_admin'])->group(function () {
    Route::post('/upload-category-image', [ImageUploadController::class, 'upload']);
    Route::post('/upload-category-data', [\App\Http\Controllers\CategoryDataUploadController::class, 'upload']);
    Route::put('/category-data/{slug}/{id}', [\App\Http\Controllers\CategoryDataUploadController::class, 'updateData']);
    Route::delete('/category-data/{slug}/{id}', [\App\Http\Controllers\CategoryDataUploadController::class, 'deleteData']);
});

// Logs
Route::get('/logs', function () {
    $logFile = storage_path('logs/laravel.log');
    if (!file_exists($logFile)) return 'No log file found.';
    $lines = file($logFile);
    return implode('', array_slice($lines, -100));
});

// Serve images through PHP since frontend Nginx container doesn't share the volume
Route::get('/uploads/{path}', function($path) {
    $file = public_path('uploads/' . $path);
    if (file_exists($file)) {
        return response()->file($file);
    }
    abort(404);
})->where('path', '.*');
