<?php
// Opt-in local routing smoke: the temporary key is rolled back; GN tables are read only.
$root = getenv('CEYLONICA_APP_ROOT') ?: dirname(__DIR__, 2);
require $root . '/vendor/autoload.php';
$app = require $root . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
function verify(bool $ok, string $why): void { if (!$ok) throw new RuntimeException($why); }
verify(getenv('ALLOW_LOCAL_LOCATION_SMOKE') === '1' && DB::connection()->getDatabaseName() === 'ceylonica_live_20261102'
    && config('database.connections.pgsql.host') === 'db', 'Refuse unknown database');
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$token = 'cey_loc_' . bin2hex(random_bytes(32));
$call = function (string $path, ?string $bearer = null) use ($kernel) {
    $server = ['HTTP_ACCEPT' => 'application/json', 'REMOTE_ADDR' => '127.0.0.1'];
    if ($bearer) $server['HTTP_AUTHORIZATION'] = 'Bearer ' . $bearer;
    return $kernel->handle(Request::create($path, 'GET', [], [], [], $server));
};
$baseline = DB::table('location_api_keys')->count();
DB::beginTransaction();
$id = null;
try {
    $id = DB::table('location_api_keys')->insertGetId(['name'=>'Temporary local routing verification','token_hash'=>hash('sha256',$token),'prefix'=>substr($token,0,16),'scope'=>'gn:read','created_by'=>'local-test','expires_at'=>now()->addMinutes(5),'created_at'=>now(),'updated_at'=>now()]);
    verify($call('/api/v1/gn/RATPA')->getStatusCode() === 401, 'Missing key route must reject');
    $result = $call('/api/v1/gn/RATPA', $token);
    verify($result->getStatusCode() === 200, 'Authenticated GN route');
    $gn = json_decode($result->getContent(),true)['data'];
    verify($gn['ccode'] === 'RATPA' && $gn['name']['en'] === 'Pahalagama', 'Actual RATPA mapping');
    verify($call('/api/v1/locations/resolve?lat=91&lng=80',$token)->getStatusCode() === 422, 'Coordinate validation route');
    verify($call('/api/v1/locations/resolve?lat=0&lng=0',$token)->getStatusCode() === 404, 'Unmatched location route');
    verify($call('/api/admin/location-api/keys',$token)->getStatusCode() === 401, 'Partner key cannot enter admin');
    $boundary = DB::table('gn_divisions')->whereRaw("'LK' || (details::json->>'PROVINCE_C') || (details::json->>'DISTRICT_C') || (details::json->>'DSD_C') || (details::json->>'GND_C') = ?",[$gn['code']])->first();
    verify($boundary !== null, 'RATPA boundary exists');
    $lookup = new App\Services\GnLocationLookup(); $point = null;
    foreach ([0.5,0.25,0.75] as $x) {
        foreach ([0.5,0.25,0.75] as $y) {
            $lat = $boundary->min_lat + ($boundary->max_lat - $boundary->min_lat) * $y;
            $lng = $boundary->min_lng + ($boundary->max_lng - $boundary->min_lng) * $x;
            if (($lookup->resolve($lat,$lng)['gn']['ccode'] ?? null) === 'RATPA') { $point = [$lat,$lng]; break 2; }
        }
    }
    verify($point !== null,'Verified internal RATPA point');
    $resolved = $call('/api/v1/locations/resolve?'.http_build_query(['lat'=>$point[0],'lng'=>$point[1]]),$token);
    verify($resolved->getStatusCode() === 200 && json_decode($resolved->getContent(),true)['data']['gn']['ccode'] === 'RATPA','Coordinate route matches actual RATPA');
    DB::table('location_api_keys')->where('id',$id)->update(['revoked_at'=>now()]);
    verify($call('/api/v1/gn/RATPA',$token)->getStatusCode() === 401,'Revocation through route');
    echo 'PASS: local HTTP kernel routes, actual Pahalagama/RATPA, invalid/unmatched input, admin isolation and revocation. Test coordinates: '.json_encode($point).'. Shared cache: '.config('cache.default').".\n";
} finally {
    DB::rollBack();
    if ($id) RateLimiter::clear('location-api:key:'.$id);
}
verify(DB::table('location_api_keys')->count() === $baseline,'Temporary key fully rolled back');
echo "Temporary key rolled back; no saved GN records changed.\n";
