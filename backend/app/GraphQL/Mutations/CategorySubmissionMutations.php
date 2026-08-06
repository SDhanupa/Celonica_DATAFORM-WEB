<?php

namespace App\GraphQL\Mutations;

use App\Models\CategorySubmission;
use App\Models\Category;
use Illuminate\Support\Facades\Log;
use Exception;

class CategorySubmissionMutations
{
    /**
     * Submit new data to a category
     */
    public function submit($_, array $args)
    {
        $user = request()->get('current_user');
        
        if (!$user) {
            throw new Exception("Unauthorized. Please log in to submit data.");
        }

        $category = Category::find($args['category_id']);
        if (!$category) {
            throw new Exception("Category not found.");
        }

        // Generate the unique code
        // Format: Pahalagama/RATPA/SAPDSGV/1
        $gnName = $args['gn_name'] ?? 'UnknownGN';
        $gnCode = $args['gn_code'] ?? 'NOCD';
        $categoryCode = $category->code ?? 'NOCAT';
        
        $submission = CategorySubmission::create([
            'category_id' => $args['category_id'],
            'user_id' => $user->id,
            'district' => $args['district'] ?? null,
            'ds_division' => $args['ds_division'] ?? null,
            'gn_name' => $args['gn_name'] ?? null,
            'gn_code' => $args['gn_code'] ?? null,
            'latitude' => $args['latitude'] ?? null,
            'longitude' => $args['longitude'] ?? null,
            'answers_data' => $args['answers_data'] ?? null,
            'status' => 'pending',
            'generated_code' => '', // placeholder
        ]);
        
        $generatedCode = "{$gnName}/{$gnCode}/{$categoryCode}/{$submission->id}";
        $submission->update(['generated_code' => $generatedCode]);

        return $submission;
    }

    /**
     * Approve or reject a category submission (Super Admin)
     */
    public function approve($_, array $args)
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin', 'admin', 'moderator'])) {
            throw new Exception("Unauthorized. Only administrators can approve or reject submissions.");
        }

        $submission = CategorySubmission::findOrFail($args['id']);
        $submission->update([
            'status' => $args['status']
        ]);

        return $submission;
    }
}
