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
                $table->string('image_path')->nullable();
                $table->unsignedBigInteger('added_by_user_id')->nullable();
                $table->boolean('is_approved')->default(true);
                $table->boolean('coordinate_mismatch')->default(false);
                $table->boolean('is_update_proposal')->default(false);
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

        // Ensure existing tables have the image_path column
        if (!Schema::hasColumn($tableName, 'image_path')) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('image_path')->nullable();
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
        $tableExists = Schema::hasTable($tableName);
        $data = collect();

        // Extract GN code early so submissions can be filtered even without a bulk table
        $gnCode = null;
        if ($request->has('gn_id') && $request->input('gn_id')) {
            $gnCode = strtoupper($request->input('gn_id'));
        }

        if ($tableExists) {
        $query = DB::table($tableName);

        // Optional filtering by specific GN/DS/District (mapped)
        if ($request->has('district_id') && $request->input('district_id')) {
            $query->where($tableName . '.district_id', $request->input('district_id'));
        }
        if ($request->has('ds_division_code') && $request->input('ds_division_code')) {
            $query->where($tableName . '.ds_division_code', $request->input('ds_division_code'));
        }
        
        // Optional filtering by raw strings (unmapped or mapped)
        if ($request->has('raw_province') && $request->input('raw_province')) {
            $query->where($tableName . '.raw_province', $request->input('raw_province'));
        }
        if ($request->has('raw_district') && $request->input('raw_district')) {
            $query->where($tableName . '.raw_district', $request->input('raw_district'));
        }
        if ($request->has('raw_ds') && $request->input('raw_ds')) {
            $query->where($tableName . '.raw_ds', $request->input('raw_ds'));
        }
        if ($request->has('raw_gn') && $request->input('raw_gn')) {
            $query->where($tableName . '.raw_gn', $request->input('raw_gn'));
        }
        if ($request->has('gn_id') && $request->input('gn_id')) {
            $gnCode = strtoupper($request->input('gn_id'));
            
            $gnQuery = DB::table('grama_niladharis')->where('CCODE', $gnCode);
            if (is_numeric($gnCode)) {
                $gnQuery->orWhere('id', $gnCode);
            }
            $gn = $gnQuery->first();
            
            $gnNames = [];
            if ($gn) {
                if ($gn->name_en) $gnNames[] = $gn->name_en;
                if ($gn->name_si) $gnNames[] = $gn->name_si;
                if ($gn->name_ta) $gnNames[] = $gn->name_ta;
            }

            $query->where(function($q) use ($tableName, $gnCode, $gn, $gnNames) {
                // 1. Matched perfectly via joined table or explicit gn_id
                $q->where($tableName . '.gn_id', $gn ? $gn->id : $gnCode)
                  ->orWhere($tableName . '.gn_id', $gnCode)
                  // 2. Unmapped but has a generated reg_number with this CCODE
                  ->orWhere($tableName . '.reg_number', 'ilike', $gnCode . '/%');
                  
                // 3. Unmapped but raw location data perfectly matches this GN
                if ($gn && !empty($gnNames)) {
                    $q->orWhere(function($subQ) use ($tableName, $gnNames, $gn) {
                        $subQ->whereIn($tableName . '.raw_gn', $gnNames);
                        if ($gn->ds_en) {
                            $subQ->where($tableName . '.raw_ds', $gn->ds_en);
                        }
                        if ($gn->dis_en) {
                            $subQ->where($tableName . '.raw_district', $gn->dis_en);
                        }
                    });
                }
            });
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
        
        if (!Schema::hasColumn($tableName, 'image_path')) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('image_path')->nullable();
            });
        }

        $data = $query->leftJoin('grama_niladharis', function($join) use ($tableName) {
                          $join->on($tableName . '.gn_id', '=', DB::raw('CAST(grama_niladharis.id AS varchar)'))
                               ->orOn($tableName . '.gn_id', '=', 'grama_niladharis.CCODE')
                               ->orOn($tableName . '.gn_id', '=', 'grama_niladharis.code');
                      })
                      ->select($tableName . '.*',
                               DB::raw("COALESCE(grama_niladharis.pro_en, $tableName.raw_province) as province_name"),
                               DB::raw("COALESCE(grama_niladharis.dis_en, $tableName.raw_district) as district_name"),
                               DB::raw("COALESCE(grama_niladharis.ds_en, $tableName.raw_ds) as ds_name"),
                               DB::raw("COALESCE(grama_niladharis.name_en, $tableName.raw_gn) as gn_name"))
                      ->orderBy($tableName . '.created_at', 'desc')
                      ->get();
        } // end if ($tableExists)

        // Merge normal user submissions so they appear in the Big Card components
        $category = \App\Models\Category::where('slug', $slug)->first();

        if ($category) {
            $normalSubmissionsQuery = \App\Models\CategorySubmission::where('category_id', $category->id)->where('status', 'approved');
            
            if (isset($gnCode)) {
                $normalSubmissionsQuery->where('gn_code', $gnCode);
            }

            $normalSubmissions = $normalSubmissionsQuery->orderBy('created_at', 'desc')->get();

            foreach ($normalSubmissions as $sub) {
                $answers = json_decode($sub->answers_data, true) ?: [];
                
                $mapped = new \stdClass();
                $mapped->id = 'normal_' . $sub->id; 
                $mapped->reg_number = $sub->generated_code;
                $mapped->address = $answers['Address'] ?? null;
                $mapped->mobile = $answers['Mobile'] ?? null;
                $mapped->contact_person_name = $answers['Contact Person'] ?? null;
                $mapped->name_en = $answers['Name (EN)'] ?? $answers['Name'] ?? null;
                $mapped->name_si = $answers['Name (SI)'] ?? null;
                $mapped->name_ta = $answers['Name (TA)'] ?? null;
                $mapped->district_name = $sub->district;
                $mapped->ds_name = $sub->ds_division;
                $mapped->gn_name = $sub->gn_name;
                $mapped->latitude = $sub->latitude;
                $mapped->longitude = $sub->longitude;
                $mapped->image_path = $answers['Image'] ?? null;
                $mapped->created_at = $sub->created_at;
                
                $data->push($mapped);
            }
            
            $data = $data->sortByDesc('created_at')->values();
        }

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

    public function uploadImage(Request $request, $slug, $id)
    {
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!Schema::hasTable($tableName)) {
            return response()->json(['success' => false, 'message' => 'Table not found.'], 404);
        }

        $record = DB::table($tableName)->where('id', $id)->first();
        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found.'], 404);
        }

        // 50MB validation = 51200 kilobytes
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:51200',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $id . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            
            $destinationPath = public_path('uploads/category_images');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            $file->move($destinationPath, $filename);
            
            // Delete old image if exists
            if (isset($record->image_path) && $record->image_path && file_exists($destinationPath . '/' . $record->image_path)) {
                unlink($destinationPath . '/' . $record->image_path);
            }

            DB::table($tableName)->where('id', $id)->update([
                'image_path' => $filename,
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully.',
                'image_path' => $filename
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No image provided.'], 400);
    }

    public function uploadSurveyImage(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:51200', // 50MB max
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . rand(1, 1000) . '_' . $file->getClientOriginalName();
            $destinationPath = public_path('uploads/survey_images');

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $filename);
            
            return response()->json([
                'success' => true,
                'image_path' => $filename,
                'url' => '/api/uploads/survey_images/' . $filename
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No file uploaded.'], 400);
    }

    public function searchCategoryData(Request $request, $slug)
    {
        $query = $request->query('query');
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!Schema::hasTable($tableName)) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $dbQuery = DB::table($tableName)->where('is_approved', true);

        $hasLocationFilter = false;
        if ($request->has('province') && $request->query('province')) {
            $val = trim(str_ireplace(' Province', '', $request->query('province')));
            $dbQuery->where(function($q) use ($val) {
                $q->where('raw_province', 'ilike', '%' . $val . '%')
                  ->orWhereNull('raw_province')
                  ->orWhere('raw_province', '');
            });
            $hasLocationFilter = true;
        }
        if ($request->has('district') && $request->query('district')) {
            $val = trim(str_ireplace(' District', '', $request->query('district')));
            $dbQuery->where(function($q) use ($val) {
                $q->where('raw_district', 'ilike', '%' . $val . '%')
                  ->orWhereNull('raw_district')
                  ->orWhere('raw_district', '');
            });
            $hasLocationFilter = true;
        }
        if ($request->has('ds') && $request->query('ds')) {
            $val = $request->query('ds');
            $dbQuery->where(function($q) use ($val) {
                $q->where('raw_ds', 'ilike', '%' . $val . '%')
                  ->orWhereNull('raw_ds')
                  ->orWhere('raw_ds', '');
            });
            $hasLocationFilter = true;
        }
        if ($request->has('gn') && $request->query('gn')) {
            $val = $request->query('gn');
            $dbQuery->where(function($q) use ($val) {
                $q->where('raw_gn', 'ilike', '%' . $val . '%')
                  ->orWhereNull('raw_gn')
                  ->orWhere('raw_gn', '');
            });
            $hasLocationFilter = true;
        }

        if (empty($query) && !$hasLocationFilter) {
            return response()->json(['success' => true, 'data' => []]);
        }

        if (!empty($query)) {
            $dbQuery->where(function($q) use ($query) {
                $q->where('name_en', 'ilike', '%' . $query . '%')
                  ->orWhere('name_si', 'ilike', '%' . $query . '%')
                  ->orWhere('name_ta', 'ilike', '%' . $query . '%')
                  ->orWhere('reg_number', 'ilike', '%' . $query . '%');
            });
        }

        $results = $dbQuery->limit(50)->get();

        return response()->json(['success' => true, 'data' => $results]);
    }

    public function submitSurveyData(Request $request, $slug)
    {
        $tableName = 'category_data_' . str_replace('-', '_', $slug);

        if (!Schema::hasTable($tableName)) {
            // Need to create the table structure if this is the first submission
            // But usually the category is created with an empty table. Let's fail if it doesn't exist.
            return response()->json(['success' => false, 'message' => 'Table does not exist.'], 400);
        }

        $payload = $request->all();
        $isUpdate = !empty($payload['reg_number']);
        
        $regNumber = $payload['reg_number'] ?? null;
        
        // Generate new Reg Number if not provided
        if (!$regNumber) {
            $gnCode = $payload['gn_code'] ?? null;
            if (!$gnCode && !empty($payload['raw_gn'])) {
                $gn = DB::table('grama_niladharis')
                    ->where('name_en', $payload['raw_gn'])
                    ->orWhere('code', $payload['raw_gn'])
                    ->orWhere('CCODE', $payload['raw_gn'])
                    ->first();
                $gnCode = $gn ? ($gn->CCODE ?: $gn->code) : 'UNKNOWN';
            } elseif (!$gnCode) {
                $gnCode = 'UNKNOWN';
            }
            
            $category = DB::table('categories')->where('slug', $slug)->first();
            $cCode = $category ? $category->code : 'CAT';
            
            // Get next sequence for this GN
            $count = DB::table($tableName)->where('reg_number', 'like', $gnCode . '/%')->count() + 1;
            $regNumber = $gnCode . '/' . $cCode . '/' . str_pad($count, 2, '0', STR_PAD_LEFT);
        }

        $insertData = [
            'reg_number' => $regNumber,
            'name_en' => $payload['name_en'] ?? null,
            'name_si' => $payload['name_si'] ?? null,
            'name_ta' => $payload['name_ta'] ?? null,
            'name_singlish' => $payload['name_singlish'] ?? null,
            'raw_province' => $payload['raw_province'] ?? null,
            'raw_district' => $payload['raw_district'] ?? null,
            'raw_ds' => $payload['raw_ds'] ?? null,
            'raw_gn' => $payload['raw_gn'] ?? null,
            'mobile' => $payload['mobile'] ?? null,
            'address' => $payload['address'] ?? null,
            'contact_person_name' => $payload['contact_person_name'] ?? null,
            'longitude' => $payload['longitude'] ?? null,
            'latitude' => $payload['latitude'] ?? null,
            'image_path' => $payload['image_path'] ?? null,
            'added_by_user_id' => auth()->id() ?? null,
            'is_approved' => false,
            'status' => 'pending',
            'is_update_proposal' => $isUpdate,
            'coordinate_mismatch' => $payload['coordinate_mismatch'] ?? false,
            'created_at' => now(),
            'updated_at' => now()
        ];

        DB::table($tableName)->insert($insertData);

        return response()->json(['success' => true, 'message' => 'Data submitted successfully.', 'reg_number' => $regNumber]);
    }

    public function approveData(Request $request, $slug, $id)
    {
        $tableName = 'category_data_' . str_replace('-', '_', $slug);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['success' => false, 'message' => 'Table not found.'], 404);
        }

        DB::table($tableName)->where('id', $id)->update([
            'is_approved' => true,
            'status' => 'approved'
        ]);

        return response()->json(['success' => true]);
    }

    public function replaceData(Request $request, $slug, $id)
    {
        $tableName = 'category_data_' . str_replace('-', '_', $slug);
        if (!Schema::hasTable($tableName)) {
            return response()->json(['success' => false, 'message' => 'Table not found.'], 404);
        }

        $newRecord = DB::table($tableName)->where('id', $id)->first();
        if (!$newRecord) {
            return response()->json(['success' => false, 'message' => 'Proposal not found.'], 404);
        }

        // Delete the old record that has the same reg_number and is approved
        DB::table($tableName)
            ->where('reg_number', $newRecord->reg_number)
            ->where('id', '!=', $id)
            ->where('status', 'approved')
            ->delete();

        // Mark the proposal as approved
        DB::table($tableName)->where('id', $id)->update([
            'is_approved' => true,
            'status' => 'approved',
            'is_update_proposal' => false
        ]);

        return response()->json(['success' => true]);
    }

    public function getUserSubmissions(Request $request)
    {
        $tables = DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'category_data_%'");
        $allSubmissions = [];

        foreach ($tables as $table) {
            $tableName = $table->tablename;
            
            // Reconstruct slug from table name
            $slug = str_replace('_', '-', substr($tableName, 14));
            $category = DB::table('categories')->where('slug', $slug)->first();
            $categoryName = $category ? $category->name_en : $slug;

            $submissions = DB::table($tableName)
                ->where('is_approved', false)
                ->orWhere('is_update_proposal', true)
                ->get()
                ->map(function($item) use ($slug, $categoryName) {
                    $item->category_slug = $slug;
                    $item->category_name = $categoryName;
                    return $item;
                });

            foreach ($submissions as $sub) {
                $allSubmissions[] = $sub;
            }
        }

        // Sort by created_at desc
        usort($allSubmissions, function($a, $b) {
            return strtotime($b->created_at) - strtotime($a->created_at);
        });

        return response()->json(['success' => true, 'data' => $allSubmissions]);
    }
}
