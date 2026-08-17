<?php

namespace App\GraphQL\Queries;

use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Cache;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class DistrictQueries
{
    public function getDistricts($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        $search = $args['search'] ?? null;
        $first = $args['first'] ?? 100;
        $page = $args['page'] ?? 1;

        $userDistrictCodes = [
            'Ampara' => 'EA',
            'Hambantota' => 'SH',
            'Jaffna' => 'NJ',
            'Vavuniya' => 'NV',
            'Mullaitivu' => 'NL',
            'Kilinochchi' => 'NK',
            'Batticaloa' => 'EB',
            'Trincomalee' => 'ET',
            'Kegalle' => 'GK',
            'Ratnapura' => 'GR',
            'Monaragala' => 'UM',
            'Colombo' => 'WC',
            'Gampaha' => 'WG',
            'Kalutara' => 'WK',
            'Kurunegala' => 'VK', 
            'Anuradhapura' => 'RA',
            'Badulla' => 'UB',
            'Galle' => 'SG',
            'Kandy' => 'CK',
            'Mannar' => 'NM',
            'Matale' => 'CM',
            'Nuwara Eliya' => 'CN',
            'Polonnaruwa' => 'RP',
        ];

        $cacheKey = "districts_{$search}_{$first}_{$page}";
        return Cache::remember($cacheKey, 86400, function() use ($search, $first, $page, $userDistrictCodes) {
            // Fetch unique districts from the database
            $uniqueDistricts = \App\Models\GramaNiladhari::select('dis_en', 'dis_si', 'dis_ta')
                ->whereNotNull('dis_en')
                ->distinct()
                ->get();

            // Fetch counts to prioritize the most frequent DCCODEs if possible, but ensuring no duplicates
            $allCodes = \App\Models\GramaNiladhari::select('dis_en', 'DCCODE', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
                ->whereNotNull('dis_en')
                ->whereNotNull('DCCODE')
                ->groupBy('dis_en', 'DCCODE')
                ->orderBy('total', 'desc')
                ->get()
                ->groupBy('dis_en');

            $assignedCodes = [];
            $districts = collect();
            
            foreach ($uniqueDistricts as $d) {
                // Skip invalid or dummy districts like LK60
                if (str_starts_with($d->dis_en, 'LK')) continue;

                $en = trim($d->dis_en);
                $si = $d->dis_si ? trim($d->dis_si) : null;
                $ta = $d->dis_ta ? trim($d->dis_ta) : null;
                
                // Check local user code map first
                $code = null;
                if (isset($userDistrictCodes[$en])) {
                    $code = $userDistrictCodes[$en];
                } else {
                    // Try to extract from DCCODE if available
                    if (isset($allCodes[$en])) {
                        foreach ($allCodes[$en] as $codeObj) {
                            if (!in_array($codeObj->DCCODE, $assignedCodes)) {
                                $code = $codeObj->DCCODE;
                                break;
                            }
                        }
                    }
                }
                
                if ($code) {
                    $assignedCodes[] = $code;
                }

                $districts->push([
                    'id' => md5($en), // Unique ID for Apollo Cache
                    'nameEn' => $en,
                    'nameSi' => $si,
                    'nameTa' => $ta,
                    'code' => $code
                ]);
            }

            $districts = $districts->sortBy('nameEn')->values();

            // Filter by search query if provided
            if ($search) {
                $search = strtolower($search);
                $districts = $districts->filter(function ($d) use ($search) {
                    return str_contains(strtolower($d['nameEn']), $search) ||
                           str_contains(strtolower($d['nameSi'] ?? ''), $search) ||
                           str_contains(strtolower($d['nameTa'] ?? ''), $search) ||
                           str_contains(strtolower($d['code'] ?? ''), $search);
                });
            }

            $offset = ($page - 1) * $first;
            return $districts->slice($offset, $first)->values()->all();
        });
    }
}
