<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminLocationApiController extends Controller
{
    private const COLUMNS = ['id', 'name', 'prefix', 'scope', 'expires_at', 'revoked_at', 'last_used_at', 'request_count', 'created_at'];

    private function authorizeAdmin(Request $request): void
    {
        $admin = $request->attributes->get('current_admin');
        abort_unless($admin instanceof \App\Models\Admin && $admin->is_active && $admin->role === 'super_admin', 403);
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin($request);
        return response()->json(['data' => DB::table('location_api_keys')->select(self::COLUMNS)->orderByDesc('id')->get()])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['name' => 'required|string|max:80', 'expires_in_days' => 'required|integer|in:0,7,30,90']);
        $name = trim($data['name']);
        abort_if($name === '', 422, 'Enter a project name.');
        $token = 'cey_loc_' . bin2hex(random_bytes(32));
        $id = DB::table('location_api_keys')->insertGetId([
            'name' => $name, 'token_hash' => hash('sha256', $token), 'prefix' => substr($token, 0, 16),
            'scope' => 'gn:read', 'created_by' => (string) $request->attributes->get('current_admin')->id,
            'expires_at' => (int) $data['expires_in_days'] === 0 ? null : now()->addDays($data['expires_in_days']), 'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['data' => DB::table('location_api_keys')->select(self::COLUMNS)->find($id), 'secret' => $token], 201)->header('Cache-Control', 'no-store');
    }

    public function revoke(Request $request, string $id)
    {
        $this->authorizeAdmin($request);
        abort_unless(ctype_digit($id) && DB::table('location_api_keys')->where('id', $id)->exists(), 404);
        DB::table('location_api_keys')->where('id', $id)->whereNull('revoked_at')->update(['revoked_at' => now(), 'updated_at' => now()]);
        return response()->json(['message' => 'Access revoked.'])->header('Cache-Control', 'no-store');
    }

    public function updateExpiry(Request $request, string $id)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['expires_in_days' => 'required|integer|in:0,7,30,90']);
        abort_unless(ctype_digit($id), 404);
        return DB::transaction(function () use ($id, $data) {
            $key = DB::table('location_api_keys')->where('id', $id)->lockForUpdate()->first();
            abort_unless($key, 404);
            abort_if($key->revoked_at || ($key->expires_at && \Carbon\Carbon::parse($key->expires_at)->isPast()), 422, 'Only active keys can change expiry. Create a new key for this project.');
            DB::table('location_api_keys')->where('id', $id)->update([
                'expires_at' => (int) $data['expires_in_days'] === 0 ? null : now()->addDays($data['expires_in_days']), 'updated_at' => now(),
            ]);
            return response()->json(['data' => DB::table('location_api_keys')->select(self::COLUMNS)->find($id)])->header('Cache-Control', 'no-store');
        });
    }

    public function preview(Request $request, \App\Services\GnLocationLookup $lookup)
    {
        $this->authorizeAdmin($request);
        $controller = new LocationApiController();
        return ($request->has('code') ? $controller->show($request, (string) $request->query('code'), $lookup) : $controller->resolve($request, $lookup))->header('Cache-Control', 'no-store');
    }
}
