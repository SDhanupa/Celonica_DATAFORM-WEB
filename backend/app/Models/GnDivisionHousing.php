<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GnDivisionHousing extends Model
{
    protected $guarded = [];

    public function gramaNiladhari()
    {
        return $this->belongsTo(GramaNiladhari::class, 'grama_niladhari_id', 'id');
    }
}
