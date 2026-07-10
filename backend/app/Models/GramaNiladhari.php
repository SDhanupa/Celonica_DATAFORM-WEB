<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GramaNiladhari extends Model
{
    protected $fillable = [
        'province_code',
        'PCCODE',
        'district_code',
        'DCCODE',
        'divisional_secretariat_code',
        'DSCCODE',
        'code',
        'CCODE',
        'name_si',
        'name_en',
        'name_ta'
    ];

    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where('name_en', 'like', "%{$search}%")
                         ->orWhere('name_si', 'like', "%{$search}%")
                         ->orWhere('name_ta', 'like', "%{$search}%")
                         ->orWhere('code', 'like', "%{$search}%")
                         ->orWhere('CCODE', 'like', "%{$search}%");
        }
        return $query;
    }

    public function police()
    {
        return $this->hasOne(Police::class, 'gnd_id', 'code');
    }

    public function postOffice()
    {
        return $this->belongsTo(PostOffice::class, 'post_office_id');
    }
}
