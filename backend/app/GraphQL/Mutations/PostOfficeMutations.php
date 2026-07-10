<?php

namespace App\GraphQL\Mutations;

use App\Models\GramaNiladhari;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class PostOfficeMutations
{
    public function updateGndPostOfficeMapping($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        $gnd = GramaNiladhari::findOrFail($args['gndId']);
        $gnd->post_office_id = $args['postOfficeId'] ?? null;
        $gnd->save();

        return $gnd;
    }
}
