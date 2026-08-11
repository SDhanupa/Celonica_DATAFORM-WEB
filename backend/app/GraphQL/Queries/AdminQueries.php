<?php

namespace App\GraphQL\Queries;

use App\Models\Admin;
use Illuminate\Http\Request;

final class AdminQueries
{
    /**
     * Return the currently authenticated admin (from middleware)
     */
    public function me(mixed $root, array $args, $context): ?Admin
    {
        return request()->get('current_admin');
    }

    private function ensureSuperAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin'])) {
            throw new \GraphQL\Error\Error('Super Admin access required');
        }
    }

    /**
     * Return all admins
     */
    public function admins(mixed $root, array $args): array
    {
        $this->ensureSuperAdmin();
        return Admin::orderBy('created_at', 'desc')->get()->toArray();
    }

    /**
     * Return a single admin by ID
     */
    public function admin(mixed $root, array $args): ?Admin
    {
        $this->ensureSuperAdmin();
        return Admin::find($args['id']);
    }

    /**
     * Return dashboard statistics (placeholder values for now)
     */
    public function dashboardStats(mixed $root, array $args): array
    {
        $this->ensureSuperAdmin();
        return [
            'totalAdmins'    => Admin::count(),
            'activeAdmins'   => Admin::where('is_active', true)->count(),
            'totalUsers'     => 0, // Will be implemented with Users module
            'totalQuestions' => 0, // Will be implemented with Questions module
            'totalReports'   => 0, // Will be implemented with Reports module
            'pendingReports' => 0,
        ];
    }
}
