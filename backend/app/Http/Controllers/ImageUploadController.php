<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        if ($request->file('image')) {
            $image = $request->file('image');
            $name = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            // Move file directly to public directory so it's accessible without storage:link
            $destinationPath = public_path('/uploads/categories');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $image->move($destinationPath, $name);

            // Construct relative URL so the browser automatically uses the correct domain
            $imageUrl = '/api/uploads/categories/' . $name;

            return response()->json([
                'success' => true,
                'url' => $imageUrl
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No image provided'], 400);
    }
}
