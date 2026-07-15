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

    public function getPopulationBothAttribute()
    {
        return PGn::join('grama_niladharis', 'p_gns.grama_niladhari_id', '=', 'grama_niladharis.id')
                  ->where('grama_niladharis.province_code', $this->admin1Pcode)
                  ->sum('p_gns.population_both');
    }

    public function getPopulationMaleAttribute()
    {
        return PGn::join('grama_niladharis', 'p_gns.grama_niladhari_id', '=', 'grama_niladharis.id')
                  ->where('grama_niladharis.province_code', $this->admin1Pcode)
                  ->sum('p_gns.population_male');
    }

    public function getPopulationFemaleAttribute()
    {
        return PGn::join('grama_niladharis', 'p_gns.grama_niladhari_id', '=', 'grama_niladharis.id')
                  ->where('grama_niladharis.province_code', $this->admin1Pcode)
                  ->sum('p_gns.population_female');
    }
}
