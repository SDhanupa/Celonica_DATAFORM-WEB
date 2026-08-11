<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;

class CategoryDataUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'slug' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'name_si' => 'nullable|string|max:255',
            'name_ta' => 'nullable|string|max:255',
            'district_id' => 'nullable|string|max:255',
            'ds_division_code' => 'nullable|string|max:255',
            'gn_id' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $nameEn = $request->input('name_en');
        $nameSi = $request->input('name_si');
        $nameTa = $request->input('name_ta');
        $districtId = $request->input('district_id');
        $dsDivisionCode = $request->input('ds_division_code');
        $gnId = $request->input('gn_id');
        $slug = $request->input('slug');

        // Always resolve gn_id to the integer ID to maintain consistency
        if (!is_numeric($gnId)) {
            // First try CCODE (e.g. RATPA), then code (e.g. LK1103030)
            $gn = DB::table('grama_niladharis')
                    ->where('CCODE', $gnId)
                    ->orWhere('code', $gnId)
                    ->first();
            if ($gn) {
                $gnId = $gn->id;
            }
        }

        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!$slug) {
            return response()->json(['success' => false, 'message' => 'Invalid category slug.'], 400);
        }

        // Verify category exists
        $category = DB::table('categories')->where('slug', $slug)->first();
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found.'], 404);
        }

        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        // Create table if it doesn't exist
        if (!Schema::hasTable($tableName)) {
            Schema::create($tableName, function (Blueprint $table) {
                $table->id();
                $table->string('district_id')->nullable();
                $table->string('ds_division_code')->nullable();
                $table->string('gn_id')->nullable();
                $table->string('reg_number')->nullable();
                $table->string('name_si')->nullable();
                $table->string('name_en')->nullable();
                $table->string('name_ta')->nullable();
                $table->string('name_singlish')->nullable();
                $table->string('longitude')->nullable();
                $table->string('latitude')->nullable();
                $table->string('mobile')->nullable();
                $table->text('description')->nullable();
                $table->string('contact_person_name')->nullable();
                $table->text('address')->nullable();
                $table->timestamps();
            });
        }

        // Process CSV
        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $data = array_map('str_getcsv', file($path));
        
        if (count($data) < 2) {
            return response()->json(['success' => false, 'message' => 'File is empty or contains only headers.'], 400);
        }
        
        // Remove headers
        $headers = array_shift($data);
        
        // Fetch existing records for duplicate checking
        $existingRecords = DB::table($tableName)
            ->where('district_id', $districtId)
            ->where('ds_division_code', $dsDivisionCode)
            ->where('gn_id', $gnId)
            ->select('name_en', 'name_si', 'name_ta')
            ->get();
            
        $existingHashes = [];
        foreach ($existingRecords as $record) {
            $hash = md5(trim($record->name_en ?: '') . '|' . trim($record->name_si ?: '') . '|' . trim($record->name_ta ?: ''));
            $existingHashes[$hash] = true;
        }

        $insertData = [];
        $duplicates = [];
        $savedCount = 0;

        foreach ($data as $row) {
            // Ensure row has the correct number of columns or pad it
            $row = array_pad($row, 11, null);
            
            $name_si = $row[1] ?: null;
            $name_en = $row[2] ?: null;
            $name_ta = $row[3] ?: null;
            
            $hash = md5(trim($name_en ?: '') . '|' . trim($name_si ?: '') . '|' . trim($name_ta ?: ''));
            
            if (isset($existingHashes[$hash])) {
                // Duplicate found
                $duplicates[] = [
                    'name_en' => $name_en,
                    'name_si' => $name_si,
                    'name_ta' => $name_ta
                ];
                continue;
            }
            
            $insertData[] = [
                'district_id' => $districtId,
                'ds_division_code' => $dsDivisionCode,
                'gn_id' => $gnId,
                'reg_number' => $row[0] ?: null,
                'name_si' => $name_si,
                'name_en' => $name_en,
                'name_ta' => $name_ta,
                'name_singlish' => $row[4] ?: null,
                'longitude' => $row[5] ?: null,
                'latitude' => $row[6] ?: null,
                'mobile' => $row[7] ?: null,
                'description' => $row[8] ?: null,
                'contact_person_name' => $row[9] ?: null,
                'address' => $row[10] ?: null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            $existingHashes[$hash] = true;
            $savedCount++;
            
            // Chunk insert to avoid memory issues with large files
            if (count($insertData) >= 500) {
                DB::table($tableName)->insert($insertData);
                $insertData = [];
            }
        }
        
        // Insert remaining
        if (count($insertData) > 0) {
            DB::table($tableName)->insert($insertData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data processing completed.',
            'saved_count' => $savedCount,
            'duplicate_count' => count($duplicates),
            'duplicates' => $duplicates
        ]);
    }

    public function getData(Request $request, $slug)
    {
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!Schema::hasTable($tableName)) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $query = DB::table($tableName);

        if ($request->has('district_id') && $request->input('district_id')) {
            $query->where($tableName . '.district_id', $request->input('district_id'));
        }
        if ($request->has('ds_division_code') && $request->input('ds_division_code')) {
            $query->where($tableName . '.ds_division_code', $request->input('ds_division_code'));
        }
        if ($request->has('gn_id') && $request->input('gn_id')) {
            $gnId = $request->input('gn_id');
            if (!is_numeric($gnId)) {
                $gn = DB::table('grama_niladharis')->where('CCODE', $gnId)->first();
                if ($gn) {
                    $gnId = $gn->id;
                }
            }
            $query->where($tableName . '.gn_id', $gnId);
        }

        $data = $query->leftJoin('grama_niladharis', function($join) use ($tableName) {
                          $join->on($tableName . '.gn_id', '=', DB::raw('CAST(grama_niladharis.id AS varchar)'));
                      })
                      ->select($tableName . '.*', 
                               'grama_niladharis.dis_en as district_name', 
                               'grama_niladharis.ds_en as ds_name', 
                               'grama_niladharis.name_en as gn_name')
                      ->orderBy($tableName . '.created_at', 'desc')
                      ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function getBulkDataCategories()
    {
        $tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'category_data_%'");
        $slugs = [];
        foreach ($tables as $table) {
            $slugs[] = str_replace('_', '-', substr($table->table_name, 14));
        }
        
        $categories = \App\Models\Category::whereIn('slug', $slugs)->get(['slug', 'name_en', 'parent_id']);
        
        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    public function updateData(Request $request, $slug, $id)
    {
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!Schema::hasTable($tableName)) {
            return response()->json(['success' => false, 'message' => 'Table not found.'], 404);
        }

        $record = DB::table($tableName)->where('id', $id)->first();
        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found.'], 404);
        }

        $updateData = $request->only([
            'reg_number', 'name_en', 'name_si', 'name_ta', 'name_singlish',
            'mobile', 'contact_person_name', 'address', 'description',
            'latitude', 'longitude'
        ]);

        $updateData['updated_at'] = now();

        DB::table($tableName)->where('id', $id)->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.'
        ]);
    }

    public function deleteData($slug, $id)
    {
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!Schema::hasTable($tableName)) {
            return response()->json(['success' => false, 'message' => 'Table not found.'], 404);
        }

        $deleted = DB::table($tableName)->where('id', $id)->delete();

        if ($deleted) {
            return response()->json(['success' => true, 'message' => 'Record deleted successfully.']);
        }

        return response()->json(['success' => false, 'message' => 'Record not found.'], 404);
    }
}
