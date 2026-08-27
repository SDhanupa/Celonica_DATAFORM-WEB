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

use App\Http\Controllers\IndustrySurveyController;

// Public API Endpoints — read-only + survey submission (throttled)
Route::middleware('throttle:30,1')->get('/guest-token', function() {
    $token = bin2hex(random_bytes(32));
    \Illuminate\Support\Facades\Cache::put('guest_token_' . $token, true, now()->addHours(24));
    return response()->json(['token' => $token, 'expires_in' => 86400]);
});

Route::middleware('throttle:60,1')->get('/search-gns', [\App\Http\Controllers\SearchController::class, 'searchGns']);

Route::middleware('throttle:120,1')->group(function () {
    Route::get('/category-data-tables', [\App\Http\Controllers\CategoryDataUploadController::class, 'getBulkDataCategories']);
    Route::get('/all-categories', [\App\Http\Controllers\CategoryDataUploadController::class, 'getAllCategories']);
    Route::get('/search-all-data', [\App\Http\Controllers\CategoryDataUploadController::class, 'searchAllData']);
    Route::get('/category-data/{slug}', [\App\Http\Controllers\CategoryDataUploadController::class, 'getData']);
    Route::get('/category-tables/{slug}', [\App\Http\Controllers\CategoryTablesController::class, 'getTablesForCategory']);
    Route::post('/upload-survey-image', [\App\Http\Controllers\CategoryDataUploadController::class, 'uploadSurveyImage']);
    Route::get('/search-category-data/{slug}', [\App\Http\Controllers\CategoryDataUploadController::class, 'searchCategoryData']);
    Route::post('/submit-survey-data/{slug}', [\App\Http\Controllers\CategoryDataUploadController::class, 'submitSurveyData']);

    // Public read: the survey form needs to load questions without auth
    Route::get('/business-survey-questions', [App\Http\Controllers\Api\BusinessSurveyQuestionController::class, 'index']);
});

// Industry Survey submission — public but tightly throttled (20/min to prevent spam) [C-02]
Route::middleware('throttle:20,1')->group(function () {
    Route::post('/industry-survey', [IndustrySurveyController::class, 'store']);
    Route::post('/industry-survey/generate-reg-number', [IndustrySurveyController::class, 'generateRegNumber']);
    // OTP Routes for mobile verification
    Route::post('/otp/send', [\App\Http\Controllers\OtpController::class, 'send']);
    Route::post('/otp/verify', [\App\Http\Controllers\OtpController::class, 'verify']);
});


// Secure Locations API
Route::middleware(['keycloak.admin'])->get('/locations', function () {
    $file = storage_path('app/locations.json');
    if (!file_exists($file)) abort(404);
    return response()->file($file, ['Content-Type' => 'application/json', 'Cache-Control' => 'public, max-age=3600']);
});

// Protected API Endpoints (Super Admin Only)
Route::middleware(['keycloak.admin', 'super_admin'])->group(function () {
    Route::get('/industry-surveys', [IndustrySurveyController::class, 'index']);
    Route::patch('/industry-surveys/{id}/approve', [IndustrySurveyController::class, 'approve']);

    Route::get('/user-submissions', [\App\Http\Controllers\CategoryDataUploadController::class, 'getUserSubmissions']);

    Route::post('/upload-category-image', [ImageUploadController::class, 'upload']);
    Route::post('/upload-category-data', [\App\Http\Controllers\CategoryDataUploadController::class, 'upload']);
    Route::put('/category-data/{slug}/{id}', [\App\Http\Controllers\CategoryDataUploadController::class, 'updateData']);
    Route::delete('/category-data/{slug}/{id}', [\App\Http\Controllers\CategoryDataUploadController::class, 'deleteData']);
    Route::post('/category-data/{slug}/bulk-delete', [\App\Http\Controllers\CategoryDataUploadController::class, 'bulkDeleteData']);
    Route::post('/category-data/{slug}/clear-all', [\App\Http\Controllers\CategoryDataUploadController::class, 'clearAllData']);
    Route::post('/category-data/{slug}/{id}/image', [\App\Http\Controllers\CategoryDataUploadController::class, 'uploadImage']);
    Route::post('/category-data/{slug}/{id}/approve', [\App\Http\Controllers\CategoryDataUploadController::class, 'approveData']);
    Route::post('/category-data/{slug}/{id}/replace', [\App\Http\Controllers\CategoryDataUploadController::class, 'replaceData']);
    Route::post('/category-data/{slug}/generate-all-reg-numbers', [\App\Http\Controllers\CategoryDataUploadController::class, 'generateAllRegNumbers']);
    Route::post('/category-data/{slug}/{id}/generate-reg-number', [\App\Http\Controllers\CategoryDataUploadController::class, 'generateRegNumber']);

    // [C-01 FIX] Business Survey Questions write operations — super_admin only
    Route::post('/business-survey-questions', [App\Http\Controllers\Api\BusinessSurveyQuestionController::class, 'store']);
    Route::put('/business-survey-questions/{id}', [App\Http\Controllers\Api\BusinessSurveyQuestionController::class, 'update']);
    Route::delete('/business-survey-questions/{id}', [App\Http\Controllers\Api\BusinessSurveyQuestionController::class, 'destroy']);
});


// Serve images through PHP since frontend Nginx container doesn't share the volume
Route::get('/uploads/{path}', function($path) {
    $file = public_path('uploads/' . $path);
    if (file_exists($file)) {
        return response()->file($file);
    }
    abort(404);
})->where('path', '.*');