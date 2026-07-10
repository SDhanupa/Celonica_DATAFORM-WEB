<?php

namespace App\GraphQL\Queries;

use App\Models\GramaNiladhari;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class DistrictQueries
{
    public function getDistricts($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        $search = $args['search'] ?? null;
        $first = $args['first'] ?? 100;
        $page = $args['page'] ?? 1;

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

        // Pre-fill assigned codes so greedy assignment doesn't take them
        foreach ($userDistrictCodes as $code) {
            $assignedCodes[] = $code;
        }

        foreach ($uniqueDistricts as $d) {
            $disEn = trim($d->dis_en);
            // Skip invalid or dummy districts like LK60
            if ($disEn === 'LK60' || empty($disEn)) {
                continue;
            }

            // Use the user's hardcoded code if it exists
            if (isset($userDistrictCodes[$disEn])) {
                $selectedCode = $userDistrictCodes[$disEn];
            } else {
                $districtCodes = $allCodes->get($d->dis_en) ?? collect();
                $selectedCode = 'UNKNOWN';

                foreach ($districtCodes as $codeRow) {
                    $code = $codeRow->DCCODE;
                    if (!in_array($code, $assignedCodes)) {
                        $selectedCode = $code;
                        $assignedCodes[] = $code;
                        break;
                    }
                }

                // Fallback if all codes were somehow taken
                if ($selectedCode === 'UNKNOWN') {
                    $selectedCode = $districtCodes->first()->DCCODE ?? 'UNKNOWN';
                }
            }

            $districts->push([
                'code' => $selectedCode,
                'nameEn' => $d->dis_en,
                'nameSi' => $d->dis_si,
                'nameTa' => $d->dis_ta,
            ]);
        }
        
        $districts = $districts->sortBy('nameEn')->values();

        if ($search) {
            $search = strtolower($search);
            $districts = $districts->filter(function ($d) use ($search) {
                return str_contains(strtolower($d['nameEn'] ?? ''), $search)
                    || str_contains(strtolower($d['nameSi'] ?? ''), $search)
                    || str_contains(strtolower($d['nameTa'] ?? ''), $search)
                    || str_contains(strtolower($d['code'] ?? ''), $search);
            })->values();
        }

        $offset = ($page - 1) * $first;
        return $districts->slice($offset, $first)->values()->all();
    }
}
