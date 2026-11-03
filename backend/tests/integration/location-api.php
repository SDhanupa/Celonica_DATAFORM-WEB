<?php
// Fixtures are isolated in SQLite memory. Never run tests against saved user data.
$root = getenv('CEYLONICA_APP_ROOT') ?: dirname(__DIR__, 2);
require $root . '/vendor/autoload.php';
$app = require $root . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Http\Controllers\AdminLocationApiController;
use App\Http\Controllers\LocationApiController;
use App\Http\Middleware\LocationApiKey;
use App\Models\Admin;
use App\Services\GnLocationLookup;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\RateLimiter;
function check(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); }
config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'database.connections.sqlite.url' => null, 'cache.default' => 'array']);
DB::purge('sqlite');
check(DB::getDriverName() === 'sqlite' && DB::connection()->getDatabaseName() === ':memory:', 'Refuse stored database');
(require $root . '/database/migrations/2026_11_02_160000_create_location_api_keys_table.php')->up();
(require $root . '/database/migrations/2026_11_02_170000_allow_non_expiring_location_api_keys.php')->up();
Schema::create('grama_niladharis', function (Blueprint $t) {
    $t->id(); foreach (['CCODE','code','name_en','name_si','name_ta','province_code','district_code','divisional_secretariat_code','pro_en','dis_en','ds_en','private_note'] as $column) $t->string($column)->nullable();
});
Schema::create('gn_divisions', function (Blueprint $t) {
    $t->id(); foreach (['min_lat','max_lat','min_lng','max_lng'] as $column) $t->float($column);
    $t->text('polygons'); $t->text('details');
});
DB::table('grama_niladharis')->insert(['CCODE'=>'RATPA','code'=>'LK9123050','name_en'=>'Pahalagama','province_code'=>'LK9','district_code'=>'LK91','divisional_secretariat_code'=>'LK9123','private_note'=>'must not leak']);
$outer = [[80,6],[81,6],[81,7],[80,7],[80,6]];
$hole = [[80.4,6.4],[80.6,6.4],[80.6,6.6],[80.4,6.6],[80.4,6.4]];
DB::table('gn_divisions')->insert(['min_lat'=>6,'max_lat'=>7,'min_lng'=>80,'max_lng'=>81,'polygons'=>json_encode([[$outer,$hole]]),'details'=>json_encode(['PROVINCE_C'=>'9','DISTRICT_C'=>'1','DSD_C'=>'23','GND_C'=>'050'])]);
$lookup = new GnLocationLookup();
check($lookup->byCode('ratpa')['ccode'] === 'RATPA', 'Case normalized CCODE');
check($lookup->byCode('LK9123050')['ccode'] === 'RATPA', 'Official code');
check(!str_contains(json_encode($lookup->byCode('RATPA')), 'must not leak'), 'Public fields only');
check($lookup->resolve(6.2,80.2)['gn']['ccode'] === 'RATPA', 'Inside polygon');
check($lookup->resolve(6.5,80.5) === null, 'Hole must not match');
check($lookup->resolve(0,0) === null, 'No external guess for uncovered location');
// Add a different GN sharing a boundary: this must be ambiguous.
DB::table('grama_niladharis')->insert(['CCODE'=>'OTHER','code'=>'LK9123051','name_en'=>'Pahalagama','province_code'=>'LK9','district_code'=>'LK91','divisional_secretariat_code'=>'LK9123']);
DB::table('gn_divisions')->insert(['min_lat'=>6,'max_lat'=>7,'min_lng'=>81,'max_lng'=>82,'polygons'=>json_encode([[[81,6],[82,6],[82,7],[81,7],[81,6]]]),'details'=>json_encode(['PROVINCE_C'=>'9','DISTRICT_C'=>'1','DSD_C'=>'23','GND_C'=>'051'])]);
check($lookup->resolve(6.2,81) === null, 'Shared edge must not choose arbitrary GN');
check($lookup->byCode('Pahalagama') === null, 'Never guess duplicate names');
$admin = new Admin(); $admin->id = 1; $admin->role = 'super_admin'; $admin->is_active = true;
$request = Request::create('/keys','POST',['name'=>'Integration test','expires_in_days'=>7]); $request->attributes->set('current_admin', $admin);
$controller = new AdminLocationApiController();
$created = $controller->store($request)->getData(true); $token = $created['secret']; $id = $created['data']['id'];
check(strlen($token) === 72, '256-bit secret');
check(DB::table('location_api_keys')->value('token_hash') === hash('sha256',$token), 'Only hash persisted');
check(!str_contains($controller->index($request)->getContent(), $token) && !str_contains($controller->index($request)->getContent(), 'token_hash'), 'List never exposes secret/hash');
$middleware = new LocationApiKey();
$api = function (?string $value, array $query = []) use ($middleware) {
    $r = Request::create('/api/v1/gn/RATPA','GET',$query);
    if ($value !== null) $r->headers->set('Authorization','Bearer '.$value);
    return $middleware->handle($r, fn () => response()->json(['ok'=>true]));
};
check($api(null)->getStatusCode() === 401, 'Missing key');
check($api(null,['api_key'=>$token])->getStatusCode() === 401, 'Reject query-string key');
check($api('invalid')->getStatusCode() === 401, 'Invalid key');
check($api($token)->getStatusCode() === 200, 'Valid key');
check(DB::table('location_api_keys')->value('request_count') === 1, 'Usage tracked');
DB::table('location_api_keys')->where('id',$id)->update(['scope'=>'other']);
check($api($token)->getStatusCode() === 403, 'Wrong scope');
DB::table('location_api_keys')->where('id',$id)->update(['scope'=>'gn:read','expires_at'=>now()->subMinute()]);
check($api($token)->getStatusCode() === 401, 'Expiry enforced');
DB::table('location_api_keys')->where('id',$id)->update(['expires_at'=>now()->addDay()]);
$request->merge(['expires_in_days'=>0]);
$updated = $controller->updateExpiry($request,(string)$id)->getData(true);
check($updated['data']['expires_at'] === null, 'Explicit never expiry');
check(DB::table('location_api_keys')->where('id',$id)->value('token_hash') === hash('sha256',$token), 'Changing expiry preserves same secret');
check($api($token)->getStatusCode() === 200, 'Non-expiring key authenticates');
$request->merge(['expires_in_days'=>30]);
check($controller->updateExpiry($request,(string)$id)->getData(true)['data']['expires_at'] !== null, 'Restore timed expiry');
$request->merge(['expires_in_days'=>0]); $controller->updateExpiry($request,(string)$id);
RateLimiter::clear('location-api:key:'.$id);
for ($i=0;$i<60;$i++) check($api($token)->getStatusCode() === 200, 'Requests within limit');
$limited = $api($token); check($limited->getStatusCode() === 429 && $limited->headers->has('Retry-After'), 'Per-key rate limit');
$controller->revoke($request,(string)$id);
check($api($token)->getStatusCode() === 401, 'Revoked key rejected immediately');
try { $controller->updateExpiry($request,(string)$id); throw new RuntimeException('Revoked key reactivated'); }
catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { check($e->getStatusCode() === 422,'Cannot reactivate revoked key'); }
$permanent = $controller->store($request)->getData(true);
check($permanent['data']['expires_at'] === null && $api($permanent['secret'])->getStatusCode() === 200,'Create never-expiring key');
DB::table('location_api_keys')->where('id',$permanent['data']['id'])->update(['expires_at'=>now()->subMinute()]);
try { $controller->updateExpiry($request,(string)$permanent['data']['id']); throw new RuntimeException('Expired key reactivated'); }
catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { check($e->getStatusCode() === 422,'Cannot reactivate expired key'); }
foreach ([null,-1,1,365,'never'] as $invalidExpiry) {
    $request->merge(['expires_in_days'=>$invalidExpiry]);
    try { $controller->store($request); throw new RuntimeException('Invalid expiry accepted'); }
    catch (Illuminate\Validation\ValidationException $e) { check($e->status === 422,'Explicit supported expiry required'); }
}
$request->merge(['expires_in_days'=>0]);
foreach (['admin','moderator','user'] as $role) {
    $admin->role = $role;
    foreach (['index','store','preview'] as $method) {
        try { $method === 'preview' ? $controller->$method($request,$lookup) : $controller->$method($request); throw new RuntimeException('Role allowed'); }
        catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { check($e->getStatusCode() === 403,'Super-admin guard'); }
    }
    try { $controller->revoke($request,(string)$id); throw new RuntimeException('Revoke allowed'); }
    catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { check($e->getStatusCode() === 403,'Revoke guard'); }
    try { $controller->updateExpiry($request,(string)$id); throw new RuntimeException('Expiry change allowed'); }
    catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { check($e->getStatusCode() === 403,'Expiry change guard'); }
}
$spoof = Request::create('/keys','GET',['current_admin'=>['role'=>'super_admin']]);
try { $controller->index($spoof); throw new RuntimeException('Spoof accepted'); }
catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { check($e->getStatusCode() === 403,'Ignore client identity'); }
$public = new LocationApiController();
foreach ([['lat'=>91,'lng'=>80],['lat'=>6,'lng'=>181],['lat'=>'NaN','lng'=>80],[]] as $query) {
    try { $public->resolve(Request::create('/resolve','GET',$query),$lookup); throw new RuntimeException('Bad coordinates accepted'); }
    catch (Illuminate\Validation\ValidationException $e) { check($e->status === 422,'Invalid coordinates'); }
}
check($public->show(Request::create('/gn/MISSING'),'MISSING',$lookup)->getStatusCode() === 404,'Missing GN');
check(DB::table('grama_niladharis')->count() === 2 && DB::table('gn_divisions')->count() === 2,'Location data preserved');
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
for ($attempt = 1; $attempt <= 181; $attempt++) {
    $guess = Request::create('/api/v1/gn/RATPA','GET',[],[],[],['REMOTE_ADDR'=>'192.0.2.77','HTTP_ACCEPT'=>'application/json','HTTP_AUTHORIZATION'=>'Bearer cey_loc_'.str_repeat('f',64)]);
    $response = $kernel->handle($guess);
    check($response->getStatusCode() === ($attempt <= 180 ? 401 : 429), 'Invalid-token IP throttling');
}
check($response->headers->has('Retry-After'), 'Rejected guesses receive retry delay');
echo "PASS: lookup, polygon holes/ambiguity, field allowlist, key hashing/secrecy, expiry, revocation, scope, rate limit, role guard, spoofing and input validation. SQLite memory only.\n";
echo "PASS: never-expiring creation, same-key expiry changes, no reactivation, duration validation and 181st invalid guess blocked.\n";
