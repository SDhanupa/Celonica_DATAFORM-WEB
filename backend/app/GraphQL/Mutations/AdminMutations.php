<?php

namespace App\GraphQL\Mutations;

use App\Models\Admin;
use GraphQL\Error\Error;

final class AdminMutations
{
    /**
     * Register a new admin linked to a Keycloak user
     */
    public function registerAdmin(mixed $root, array $args): Admin
    {
        if (Admin::where('keycloak_sub', $args['keycloakSub'])->exists()) {
            throw new Error('An admin with this Keycloak ID already exists.');
        }

        if (Admin::where('email', $args['email'])->exists()) {
            throw new Error('An admin with this email already exists.');
        }

        return Admin::create([
            'keycloak_sub' => $args['keycloakSub'],
            'email'        => $args['email'],
            'name'         => $args['name'],
            'role'         => strtolower($args['role']),
            'is_active'    => true,
        ]);
    }

    /**
     * Update an admin's role
     */
    public function updateAdminRole(mixed $root, array $args): Admin
    {
        $admin = Admin::findOrFail($args['id']);
        $admin->update(['role' => strtolower($args['role'])]);
        return $admin->fresh();
    }

    /**
     * Deactivate an admin account
     */
    public function deactivateAdmin(mixed $root, array $args): Admin
    {
        $admin = Admin::findOrFail($args['id']);
        $admin->update(['is_active' => false]);
        return $admin->fresh();
    }

    /**
     * Reactivate an admin account
     */
    public function activateAdmin(mixed $root, array $args): Admin
    {
        $admin = Admin::findOrFail($args['id']);
        $admin->update(['is_active' => true]);
        return $admin->fresh();
    }
}
