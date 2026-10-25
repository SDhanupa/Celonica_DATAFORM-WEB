<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // Hosted accounts use UUID strings; never cast an existing ID to an integer.
    protected $keyType = 'string';

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            // Preserve numeric auto-increment databases while supplying IDs for
            // the hosted string-key schema. This requires no data migration.
            $type = $user->getConnection()->getSchemaBuilder()
                ->getColumnType($user->getTable(), $user->getKeyName());

            if (in_array($type, ['uuid', 'varchar', 'character varying', 'char', 'bpchar', 'text', 'string'], true)) {
                $user->setIncrementing(false);
                if ($user->getKey() === null) {
                    $user->setAttribute($user->getKeyName(), (string) Str::uuid());
                }
            }
        });
    }

    public function getFirstNameAttribute()
    {
        return explode(' ', $this->name)[0] ?? 'User';
    }

    public function getLastNameAttribute()
    {
        $parts = explode(' ', $this->name);
        return isset($parts[1]) ? implode(' ', array_slice($parts, 1)) : '';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'nic',
        'mobile_number',
        'address',
        'dob',
        'gender',
        'keycloak_sub',
    ];

    /**
     * Get the deterministic Keycloak proxy password for this user
     */
    public function getProxyPassword(): string
    {
        // Deterministic hash based on app key, user NIC, and mobile to ensure it's securely linked to them
        return hash_hmac('sha256', $this->nic . '|' . $this->mobile_number, config('app.key'));
    }

    /**
     * The attributes that should be hidden for serialization.

     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
