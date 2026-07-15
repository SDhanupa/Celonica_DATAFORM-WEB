<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PProvince extends Model
{
    protected $table = 'p_province';
    protected $guarded = [];

    public function gramaNiladharis()
    {
        return $this->hasMany(GramaNiladhari::class, 'province_code', 'admin1Pcode');
    }

    public function pDistricts()
    {
        return $this->hasMany(PDistrict::class, 'admin1Pcode', 'admin1Pcode');
    }
}
