<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrsArea extends Model
{
    protected $fillable = [
        'code',
        'location',
        'full_location_name',
        'location_type',
        'name_si',
        'name_en',
        'name_ta',
        'district'
    ];
}
