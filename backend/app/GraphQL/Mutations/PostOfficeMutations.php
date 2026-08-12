<?php

namespace App\GraphQL\Mutations;

use App\Models\GramaNiladhari;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class PostOfficeMutations
{
    private function ensureSuperAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin'])) {
            throw new \GraphQL\Error\Error('Super Admin access required');
        }
    }

    public function updateGndPostOfficeMapping($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        $this->ensureSuperAdmin();
        $gnd = GramaNiladhari::findOrFail($args['gndId']);
        $gnd->post_office_id = $args['postOfficeId'] ?? null;
        $gnd->save();

        return $gnd;
    }
}
