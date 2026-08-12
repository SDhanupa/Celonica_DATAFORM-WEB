<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CategoryDataUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'slug' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $slug = $request->input('slug');
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!$slug) {
            return response()->json(['success' => false, 'message' => 'Invalid category slug.'], 400);
        }

        // Verify category exists
        $category = DB::table('categories')->where('slug', $slug)->first();
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found.'], 404);
        }

        // Create table if it doesn't exist
        if (!Schema::hasTable($tableName)) {
            Schema::create($tableName, function (Blueprint $table) {
                $table->id();
                $table->string('district_id')->nullable();
                $table->string('ds_division_code')->nullable();
                $table->string('gn_id')->nullable();
                $table->string('raw_province')->nullable();
                $table->string('raw_district')->nullable();
                $table->string('raw_ds')->nullable();
                $table->string('raw_gn')->nullable();
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
        
        // Ensure existing tables have the raw columns
        if (!Schema::hasColumn($tableName, 'raw_province')) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('raw_province')->nullable();
                $table->string('raw_district')->nullable();
                $table->string('raw_ds')->nullable();
                $table->string('raw_gn')->nullable();
            });
        }

        // Pre-fetch all GNs to build a fast memory map
        $allGns = DB::table('grama_niladharis')->get([
            'id', 'name_en', 'CCODE', 'pro_en', 'dis_en', 'ds_en', 'district_code', 'divisional_secretariat_code'
        ]);
        
        $gnMap = [];
        foreach ($allGns as $gn) {
            // Build the 4-tier hierarchy key (we ignore National as it's always SL)
            $key = strtolower(trim($gn->name_en) . '|' . trim($gn->ds_en) . '|' . trim($gn->dis_en) . '|' . trim($gn->pro_en));
            $gnMap[$key] = $gn;
            
            // Also map by CCODE if it exists
            if ($gn->CCODE) {
                $gnMap[strtolower(trim($gn->CCODE))] = $gn;
            }
        }

        // Process CSV
        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $data = array_map('str_getcsv', file($path));
        
        if (count($data) < 2) {
            return response()->json(['success' => false, 'message' => 'File is empty or contains only headers.'], 400);
        }
        
        // Remove headers
        array_shift($data);
        
        // Fetch existing records for duplicate checking globally for this table
        $existingRecords = DB::table($tableName)->select('gn_id', 'name_en', 'name_si', 'name_ta')->get();
        $existingHashes = [];
        foreach ($existingRecords as $record) {
            $hash = md5(($record->gn_id ?: 'null') . '|' . trim($record->name_en ?: '') . '|' . trim($record->name_si ?: '') . '|' . trim($record->name_ta ?: ''));
            $existingHashes[$hash] = true;
        }

        $insertData = [];
        $duplicates = [];
        $savedCount = 0;

        foreach ($data as $row) {
            // New 16-column CSV structure
            $row = array_pad($row, 16, null);
            
            $province = strtolower(trim($row[1] ?? ''));
            $district = strtolower(trim($row[2] ?? ''));
            $ds = strtolower(trim($row[3] ?? ''));
            $gn_val = strtolower(trim($row[4] ?? ''));
            
            $mapped_gn_id = null;
            $mapped_district_id = null;
            $mapped_ds_code = null;
            
            if (isset($gnMap[$gn_val])) {
                $matchedGn = $gnMap[$gn_val];
                $mapped_gn_id = $matchedGn->id;
                $mapped_district_id = $matchedGn->district_code;
                $mapped_ds_code = $matchedGn->divisional_secretariat_code;
            } else {
                $searchKey = $gn_val . '|' . $ds . '|' . $district . '|' . $province;
                if (isset($gnMap[$searchKey])) {
                    $matchedGn = $gnMap[$searchKey];
                    $mapped_gn_id = $matchedGn->id;
                    $mapped_district_id = $matchedGn->district_code;
                    $mapped_ds_code = $matchedGn->divisional_secretariat_code;
                }
            }

            // The data columns start from index 5
            $reg_number = $row[5] ?: null;
            $name_si = $row[6] ?: null;
            $name_en = $row[7] ?: null;
            $name_ta = $row[8] ?: null;
            $name_singlish = $row[9] ?: null;
            $longitude = $row[10] ?: null;
            $latitude = $row[11] ?: null;
            $mobile = $row[12] ?: null;
            $description = $row[13] ?: null;
            $contact_person = $row[14] ?: null;
            $address = $row[15] ?: null;
            
            $hash = md5(($mapped_gn_id ?: 'null') . '|' . trim($name_en ?: '') . '|' . trim($name_si ?: '') . '|' . trim($name_ta ?: ''));
            
            if (isset($existingHashes[$hash])) {
                $duplicates[] = [
                    'name_en' => $name_en,
                    'name_si' => $name_si,
                    'name_ta' => $name_ta
                ];
                continue;
            }
            
            $insertData[] = [
                'district_id' => $mapped_district_id,
                'ds_division_code' => $mapped_ds_code,
                'gn_id' => $mapped_gn_id,
                'raw_province' => $province ?: null,
                'raw_district' => $district ?: null,
                'raw_ds' => $ds ?: null,
                'raw_gn' => $gn_val ?: null,
                'reg_number' => $reg_number,
                'name_si' => $name_si,
                'name_en' => $name_en,
                'name_ta' => $name_ta,
                'name_singlish' => $name_singlish,
                'longitude' => $longitude,
                'latitude' => $latitude,
                'mobile' => $mobile,
                'description' => $description,
                'contact_person_name' => $contact_person,
                'address' => $address,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            $existingHashes[$hash] = true;
            $savedCount++;
            
            if (count($insertData) >= 500) {
                DB::table($tableName)->insert($insertData);
                $insertData = [];
            }
        }
        
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

        // Optional filtering by specific GN/DS/District
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

        // Special flag to only return NULL data (unmapped)
        if ($request->has('unmapped_only') && $request->input('unmapped_only') == 'true') {
            $query->whereNull($tableName . '.gn_id');
        } elseif ($request->has('mapped_only') && $request->input('mapped_only') == 'true') {
            $query->whereNotNull($tableName . '.gn_id');
        }

        // Ensure the table has the raw columns before querying to prevent SQL errors on older tables
        if (!Schema::hasColumn($tableName, 'raw_province')) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('raw_province')->nullable();
                $table->string('raw_district')->nullable();
                $table->string('raw_ds')->nullable();
                $table->string('raw_gn')->nullable();
            });
        }

        $data = $query->leftJoin('grama_niladharis', function($join) use ($tableName) {
                          $join->on($tableName . '.gn_id', '=', DB::raw('CAST(grama_niladharis.id AS varchar)'));
                      })
                      ->select($tableName . '.*', 
                               DB::raw("COALESCE(grama_niladharis.pro_en, $tableName.raw_province) as province_name"),
                               DB::raw("COALESCE(grama_niladharis.dis_en, $tableName.raw_district) as district_name"),
                               DB::raw("COALESCE(grama_niladharis.ds_en, $tableName.raw_ds) as ds_name"),
                               DB::raw("COALESCE(grama_niladharis.name_en, $tableName.raw_gn) as gn_name"))
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

    public function bulkDeleteData(Request $request, $slug)
    {
        \Illuminate\Support\Facades\Log::info('bulkDeleteData hit', ['slug' => $slug, 'ids' => $request->input('ids')]);
        
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!Schema::hasTable($tableName)) {
            \Illuminate\Support\Facades\Log::info('Table not found: ' . $tableName);
            return response()->json(['success' => false, 'message' => 'Table not found.'], 404);
        }

        $ids = $request->input('ids');
        if (!is_array($ids) || count($ids) === 0) {
            \Illuminate\Support\Facades\Log::info('No IDs provided');
            return response()->json(['success' => false, 'message' => 'No IDs provided.'], 400);
        }

        try {
            $deleted = DB::table($tableName)->whereIn('id', $ids)->delete();
            \Illuminate\Support\Facades\Log::info('Deleted count: ' . $deleted);

            return response()->json([
                'success' => true, 
                'message' => $deleted . ' records deleted successfully.'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Bulk delete failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error during deletion: ' . $e->getMessage()
            ], 500);
        }
    }
}
