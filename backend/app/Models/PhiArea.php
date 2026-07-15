<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhiArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'ccode',
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
