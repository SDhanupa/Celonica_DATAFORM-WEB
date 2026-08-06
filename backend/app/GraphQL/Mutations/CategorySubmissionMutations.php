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
        try {
            $user = request()->get('current_user');
            $admin = request()->get('current_admin');
            
            if (!$user && !$admin) {
                throw new Exception("Unauthorized. Please log in to submit data.");
            }

            $userId = null;
            if ($user) {
                $userId = $user->id;
            } else if ($admin) {
                $matchedUser = User::where('keycloak_sub', $admin->keycloak_sub)->orWhere('email', $admin->email)->first();
                if (!$matchedUser) {
                    $matchedUser = User::create([
                        'name' => $admin->name ?? 'Admin',
                        'email' => $admin->email ?? 'admin@celonica.local',
                        'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                        'keycloak_sub' => $admin->keycloak_sub,
                    ]);
                }
                $userId = $matchedUser->id;
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
                'user_id' => $userId,
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
        } catch (\Throwable $e) {
            Log::error('submitCategoryData error', ['message' => $e->getMessage()]);
            throw new Exception("Failed to submit data: " . $e->getMessage());
        }
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
