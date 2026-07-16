<?php

namespace App\GraphQL\Queries;

use App\Models\GnDivisionHousing;
use App\Models\GramaNiladhari;
use App\Models\PDistrict;

class HousingDataQuery
{
    /**
     * @param  null  $_
     * @param  array{}  $args
     */
    public function __invoke($_, array $args)
    {
        $query = GnDivisionHousing::query();
        $locationName = 'Unknown Location';
        $hasData = false;

        if (!empty($args['gn_id'])) {
            $query->where('grama_niladhari_id', $args['gn_id']);
            $gn = GramaNiladhari::find($args['gn_id']);
            if ($gn) {
                $locationName = $gn->name_en . ' GN Division';
                $hasData = true;
            }
        } elseif (!empty($args['city_code'])) {
            $gnIds = GramaNiladhari::where('divisional_secretariat_code', $args['city_code'])->pluck('id');
            if ($gnIds->isNotEmpty()) {
                $query->whereIn('grama_niladhari_id', $gnIds);
                // We'll just grab the ds_en of the first GN to use as the City Name
                $firstGn = GramaNiladhari::where('divisional_secretariat_code', $args['city_code'])->first();
                $locationName = ($firstGn ? $firstGn->ds_en : $args['city_code']) . ' DS Division';
                $hasData = true;
            }
        } elseif (!empty($args['district_id'])) {
            $district = PDistrict::find($args['district_id']);
            if ($district) {
                // Find GNs that have this district Code
                $gnIds = GramaNiladhari::where('district_code', $district->admin2Pcode)->pluck('id');
                if ($gnIds->isNotEmpty()) {
                    $query->whereIn('grama_niladhari_id', $gnIds);
                    $locationName = $district->admin2NameEn . ' District';
                    $hasData = true;
                }
            }
        }

        if (!$hasData) {
            return null;
        }

        // Aggregate the data
        return [
            'location_name' => $locationName,
            'total_housing_units' => (int) $query->sum('total_housing_units'),
            'y_2011' => (int) $query->sum('y_2011'),
            'y_2010' => (int) $query->sum('y_2010'),
            'y_2009' => (int) $query->sum('y_2009'),
            'y_2008' => (int) $query->sum('y_2008'),
            'y_2007' => (int) $query->sum('y_2007'),
            'y_2006' => (int) $query->sum('y_2006'),
            'y_2005' => (int) $query->sum('y_2005'),
            'y_2000_2004' => (int) $query->sum('y_2000_2004'),
            'y_1995_1999' => (int) $query->sum('y_1995_1999'),
            'y_1990_1994' => (int) $query->sum('y_1990_1994'),
            'y_1980_1989' => (int) $query->sum('y_1980_1989'),
            'before_80' => (int) $query->sum('before_80'),
        ];
    }
}
