<?php

namespace App\GraphQL\Queries;

use App\Models\User;
use Illuminate\Http\Request;

final class UserQueries
{
    private function ensureSuperAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin'])) {
            throw new \GraphQL\Error\Error('Super Admin access required');
        }
    }

    /**
     * Return the currently authenticated normal user (from middleware)
     */
    public function meUser(mixed $root, array $args, $context): ?User
    {
        return request()->get('current_user');
    }

    /**
     * Compatibility for older clients: signup replaces duplicate onboarding.
     */
    public function needsOnboarding(mixed $root, array $args, $context): bool
    {
        return false;
    }

    public function usersBuilder(mixed $root, array $args)
    {
        $this->ensureSuperAdmin();
        return User::query();
    }

    public function userBuilder(mixed $root, array $args)
    {
        $this->ensureSuperAdmin();
        return User::query();
    }
}
