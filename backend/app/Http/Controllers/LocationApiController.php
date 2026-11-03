<?php

namespace App\Http\Controllers;

use App\Services\GnLocationLookup;
use Illuminate\Http\Request;

class LocationApiController extends Controller
{
    public function show(Request $request, string $code, GnLocationLookup $lookup)
    {
        validator(['code' => $code], ['code' => ['required', 'string', 'max:30', 'regex:/^[A-Za-z0-9]+$/D']])->validate();
        $gn = $lookup->byCode($code);
        return $gn ? response()->json(['data' => $gn]) : response()->json(['message' => 'No unique GN division found for this code.'], 404);
    }

    public function resolve(Request $request, GnLocationLookup $lookup)
    {
        $data = $request->validate(['lat' => 'required|numeric|between:-90,90', 'lng' => 'required|numeric|between:-180,180']);
        $result = $lookup->resolve((float) $data['lat'], (float) $data['lng']);
        return $result ? response()->json(['data' => $result])
            : response()->json(['message' => 'No unique GN boundary match. The location may be outside coverage, on a shared boundary, or missing a code mapping.'], 404);
    }
}
