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

        // ID format: {categoryId}_{recordId} (for bulk) OR just an integer for normal user submissions
        if (!str_contains($args['id'], '_')) {
            // Normal user submission — always update status, NEVER delete (keep history)
            $submission = CategorySubmission::find($args['id']);
            if (!$submission) {
                throw new Exception("Submission not found.");
            }
            // Map 'revoked' → set status to revoked, keep visible in history as greyed-out
            $submission->update(['status' => $args['status']]);
            return [
                'id' => $args['id'],
                'status' => $args['status']
            ];

        }

        $parts = explode('_', $args['id']);
        if (count($parts) !== 2) {
            throw new Exception("Invalid submission ID format.");
        }
        $categoryId = $parts[0];
        $recordId = $parts[1];

        $category = Category::find($categoryId);
        if (!$category) {
            throw new Exception("Category not found.");
        }

        $tableName = 'category_data_' . str_replace('-', '_', $category->slug);
        
        if (!\Illuminate\Support\Facades\Schema::hasTable($tableName)) {
            throw new Exception("Data table for this category does not exist.");
        }

        if ($args['status'] === 'rejected') {
            // Delete rejected proposals
            \Illuminate\Support\Facades\DB::table($tableName)->where('id', $recordId)->delete();
            return [
                'id' => $args['id'],
                'status' => 'rejected'
            ];
        } else {
            \Illuminate\Support\Facades\DB::table($tableName)->where('id', $recordId)->update([
                'status' => $args['status'],
                'is_approved' => ($args['status'] === 'approved')
            ]);
            return [
                'id' => $args['id'],
                'status' => $args['status']
            ];
        }
    }
}
