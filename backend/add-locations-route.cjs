const fs = require("fs");
let content = fs.readFileSync("backend/routes/api.php", "utf8");

const locationsRoute = `
// Secure Locations API
Route::middleware(['keycloak.admin'])->get('/locations', function () {
    $file = storage_path('app/locations.json');
    if (!file_exists($file)) abort(404);
    return response()->file($file, ['Content-Type' => 'application/json', 'Cache-Control' => 'public, max-age=3600']);
});
`;

content = content.replace("// Protected API Endpoints (Super Admin Only)", locationsRoute + "\n// Protected API Endpoints (Super Admin Only)");
fs.writeFileSync("backend/routes/api.php", content);
console.log("Added locations route");
