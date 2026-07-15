<?php

namespace App\GraphQL\Queries;

use App\Models\PhiArea;

class PhiAreaQueries
{
    /**
     * @param  null  $_
     * @param  array{}  $args
     */
    public function phiAreasByDistrict($_, array $args)
    {
        $district = $args['district'];

        // Find all PHI areas mapped to this district
        return PhiArea::where('district', $district)->get();
    }
}
