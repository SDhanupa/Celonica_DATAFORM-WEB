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
     * Return true if the user needs onboarding
     */
    public function needsOnboarding(mixed $root, array $args, $context): bool
    {
        $request = request();
        
        if ($request->get('needs_onboarding', false) === true) {
            return true;
        }

        $user = $request->get('current_user');
        if ($user) {
            if (empty($user->nic) || empty($user->mobile_number) || empty($user->address) || empty($user->dob) || empty($user->gender)) {
                return true;
            }
        }

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
