<?php

namespace App\GraphQL\Queries;

use App\Models\TrsArea;

class TrsAreaQueries
{
    /**
     * @param  null  $_
     * @param  array{}  $args
     */
    public function trsAreasByDistrict($_, array $args)
    {
        $district = $args['district'];

        // Find all TRS areas mapped to this district
        return TrsArea::where('district', $district)->get();
    }
}
