<?php

namespace App\GraphQL\Queries;

use App\Models\CategorySubmission;

class CategorySubmissionQueries
{
    private function ensureSuperAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin'])) {
            throw new \GraphQL\Error\Error('Super Admin access required');
        }
    }

    private function fetchFromDynamicTables($categoryId, $filters = [])
    {
        $categories = \App\Models\Category::all();
        $categoryIds = [$categoryId];
        
        $hasMore = true;
        while ($hasMore) {
            $hasMore = false;
            foreach ($categories as $cat) {
                if (in_array($cat->parent_id, $categoryIds) && !in_array($cat->id, $categoryIds)) {
                    $categoryIds[] = $cat->id;
                    $hasMore = true;
                }
            }
        }

        // Get leaf categories only
        $leafCategories = $categories->filter(function($c) use ($categoryIds, $categories) {
            return in_array($c->id, $categoryIds) && !$categories->where('parent_id', $c->id)->count();
        });

        $submissions = collect();

        $gnNames = [];
        $gnInfo = null;
        $gnCode = isset($filters['gn_code']) ? strtoupper($filters['gn_code']) : null;
        
        if ($gnCode) {
            $gnQuery = \Illuminate\Support\Facades\DB::table('grama_niladharis')
                ->where('CCODE', $gnCode);
                
            if (is_numeric($gnCode)) {
                $gnQuery->orWhere('id', $gnCode);
            }
            
            $gnInfo = $gnQuery->first();
                
            if ($gnInfo) {
                if ($gnInfo->name_en) $gnNames[] = $gnInfo->name_en;
                if ($gnInfo->name_si) $gnNames[] = $gnInfo->name_si;
                if ($gnInfo->name_ta) $gnNames[] = $gnInfo->name_ta;
            }
        }

        foreach ($leafCategories as $leafCat) {
            $tableName = 'category_data_' . str_replace('-', '_', $leafCat->slug);
            if (\Illuminate\Support\Facades\Schema::hasTable($tableName)) {
                $query = \Illuminate\Support\Facades\DB::table($tableName);
                
                if (isset($filters['status']) && $filters['status'] !== 'all') {
                    if (\Illuminate\Support\Facades\Schema::hasColumn($tableName, 'status')) {
                        $query->where('status', $filters['status']);
                    }
                }
                
                $query->leftJoin('grama_niladharis', function($join) use ($tableName) {
                    $join->on($tableName . '.gn_id', '=', \Illuminate\Support\Facades\DB::raw('CAST(grama_niladharis.id AS varchar)'))
                         ->orOn($tableName . '.gn_id', '=', 'grama_niladharis.CCODE')
                         ->orOn($tableName . '.gn_id', '=', 'grama_niladharis.code');
                });
                
                if ($gnCode) {
                    $query->where(function($q) use ($gnCode, $tableName, $gnNames, $gnInfo) {
                        // 1. Matched perfectly via joined table or explicit gn_id
                        $q->where('grama_niladharis.CCODE', $gnCode)
                          ->orWhere($tableName . '.gn_id', $gnCode)
                          // 2. Unmapped but has a generated reg_number with this CCODE
                          ->orWhere($tableName . '.reg_number', 'ilike', $gnCode . '/%');
                          
                        // 3. Unmapped but raw location data perfectly matches this GN
                        if ($gnInfo && !empty($gnNames)) {
                            $q->orWhere(function($subQ) use ($tableName, $gnNames, $gnInfo) {
                                $subQ->whereIn($tableName . '.raw_gn', $gnNames);
                                if ($gnInfo->ds_en) {
                                    $subQ->where($tableName . '.raw_ds', $gnInfo->ds_en);
                                }
                                if ($gnInfo->dis_en) {
                                    $subQ->where($tableName . '.raw_district', $gnInfo->dis_en);
                                }
                            });
                        }
                    });
                }
                
                $query->select(
                    $tableName . '.*', 
                    'grama_niladharis.CCODE as joined_gn_code', 
                    'grama_niladharis.name_en as joined_gn_name',
                    'grama_niladharis.pro_en as joined_pro_name',
                    'grama_niladharis.dis_en as joined_dis_name',
                    'grama_niladharis.ds_en as joined_ds_name'
                );
                
                $records = $query->orderBy($tableName . '.created_at', 'desc')->get();
                
                foreach ($records as $record) {
                    $answersData = [];
                    // Add accurately matched location data back to the cards
                    $answersData['National'] = 'Sri Lanka';
                    
                    $prov = $record->joined_pro_name ?: $record->raw_province;
                    if ($prov) $answersData['Province'] = $prov;
                    
                    $dist = $record->joined_dis_name ?: $record->raw_district;
                    if ($dist) $answersData['District'] = $dist;
                    
                    $ds = $record->joined_ds_name ?: $record->raw_ds;
                    if ($ds) $answersData['DS Division'] = $ds;
                    
                    $gn = $record->joined_gn_name ?: $record->raw_gn;
                    if ($gn) $answersData['GN Name'] = $gn;

                    if ($record->name_en) $answersData['Name (EN)'] = $record->name_en;
                    if ($record->name_si) $answersData['Name (SI)'] = $record->name_si;
                    if ($record->name_ta) $answersData['Name (TA)'] = $record->name_ta;
                    if ($record->mobile) $answersData['Mobile'] = $record->mobile;
                    if ($record->contact_person_name) $answersData['Contact Person'] = $record->contact_person_name;
                    if ($record->address) $answersData['Address'] = $record->address;
                    if ($record->image_path) $answersData['Image'] = $record->image_path;
                    
                    $model = new CategorySubmission([
                        'id' => $leafCat->id . '_' . $record->id,
                        'category_id' => $leafCat->id,
                        'user_id' => $record->added_by_user_id,
                        'district' => $record->raw_district,
                        'ds_division' => $record->raw_ds,
                        'gn_name' => $record->joined_gn_name ?: $record->raw_gn,
                        'gn_code' => $record->joined_gn_code ?: $record->gn_id,
                        'latitude' => $record->latitude === '' ? null : $record->latitude,
                        'longitude' => $record->longitude === '' ? null : $record->longitude,
                        'generated_code' => $record->reg_number,
                        'answers_data' => json_encode($answersData),
                        'status' => $record->status ?? ($record->is_approved ? 'approved' : 'pending'),
                    ]);
                    
                    $model->created_at = $record->created_at ?? date('Y-m-d H:i:s');
                    $model->updated_at = $record->updated_at ?? $record->created_at ?? date('Y-m-d H:i:s');
                    // Force the ID to be saved as the string composite ID (Eloquent might cast it to int by default)
                    $model->setAttribute('id', $leafCat->id . '_' . $record->id);
                    
                    $submissions->push($model);
                }
            }
        }
        $normalSubmissionsQuery = CategorySubmission::whereIn('category_id', $categoryIds);
        
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $normalSubmissionsQuery->where('status', $filters['status']);
        }
        
        if (isset($filters['gn_code'])) {
            $normalSubmissionsQuery->where('gn_code', $filters['gn_code']);
        }
        
        $normalSubmissions = $normalSubmissionsQuery->get();
        
        foreach ($normalSubmissions as $sub) {
            $submissions->push($sub);
        }
        
        return $submissions->sortByDesc('created_at')->values();
    }

    public function pending($_, array $args)
    {
        $this->ensureSuperAdmin();
        return $this->fetchFromDynamicTables($args['category_id'], ['status' => 'pending']);
    }

    public function approved($_, array $args)
    {
        return $this->fetchFromDynamicTables($args['category_id'], [
            'status' => 'approved',
            'gn_code' => $args['gn_code']
        ]);
    }

    public function all($_, array $args)
    {
        $this->ensureSuperAdmin();
        $status = $args['status'] ?? 'all';
        return $this->fetchFromDynamicTables($args['category_id'], ['status' => $status]);
    }
}
