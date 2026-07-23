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

// Image Upload
Route::post('/upload-category-image', [ImageUploadController::class, 'upload']);

// Serve images through PHP since frontend Nginx container doesn't share the volume
Route::get('/uploads/{path}', function($path) {
    $file = public_path('uploads/' . $path);
    if (file_exists($file)) {
        return response()->file($file);
    }
    abort(404);
})->where('path', '.*');
