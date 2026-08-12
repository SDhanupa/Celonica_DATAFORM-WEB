<?php

namespace App\GraphQL\Mutations;

use App\Models\Police;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class PoliceMutations
{
    private function ensureSuperAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin'])) {
            throw new \GraphQL\Error\Error('Super Admin access required');
        }
    }

    public function updatePoliceMapping($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        $this->ensureSuperAdmin();
        // Find existing or create new
        $police = Police::where('gnd_id', $args['code'])->first();

        if ($police) {
            $police->update([
                'ps_id' => $args['ps_id'] ?? null,
                'ps_name' => $args['ps_name'],
                'ps_name_si' => $args['ps_name_si'] ?? null,
                'ps_name_ta' => $args['ps_name_ta'] ?? null,
            ]);
            return $police;
        }

        // If no matching police record exists for this code, create a new one.
        return Police::create([
            'gnd_id' => $args['code'],
            'ps_id' => $args['ps_id'] ?? null,
            'ps_name' => $args['ps_name'],
            'ps_name_si' => $args['ps_name_si'] ?? null,
            'ps_name_ta' => $args['ps_name_ta'] ?? null,
        ]);
    }
}
