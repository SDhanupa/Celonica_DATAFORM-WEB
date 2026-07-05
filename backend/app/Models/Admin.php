<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $table = 'admins';

    protected $fillable = [
        'keycloak_sub',
        'email',
        'name',
        'role',
        'is_active',
        'last_login_at',
        'nic',
        'mobile_number',
        'address',
        'dob',
        'gender',
    ];

    protected $casts = [
        'is_active'     => 'boolean',
        'last_login_at' => 'datetime',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    /**
     * Valid roles
     */
    const ROLES = ['super_admin', 'admin', 'moderator'];

    /**
     * Scope: only active admins
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Find admin by Keycloak subject ID
     */
    public static function findByKeycloakSub(string $sub): ?self
    {
        return self::where('keycloak_sub', $sub)->first();
    }
}
