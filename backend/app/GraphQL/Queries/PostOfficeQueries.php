<?php

namespace App\GraphQL\Queries;

use App\Models\PostOffice;

class PostOfficeQueries
{
    public function postOfficesByDistrict($_root, array $args)
    {
        return PostOffice::where('district', $args['district'])->orderBy('place_name_english')->get();
    }
}

