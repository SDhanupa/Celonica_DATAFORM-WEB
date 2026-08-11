<?php

namespace App\GraphQL\Queries;

use App\Models\CategorySubmission;

class CategorySubmissionQueries
{
    private function ensureSuperAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin'])) {
            throw new \GraphQL\Error\Error('Super Admin access required');
        }
    }

    /**
     * Get pending submissions for a category (Admin)
     */
    public function pending($_, array $args)
    {
        $this->ensureSuperAdmin();
        $categoryId = $args['category_id'];
        
        // Get the category and all its descendant IDs recursively
        $categories = \App\Models\Category::all();
        $categoryIds = [$categoryId];
        
        $hasMore = true;
        while ($hasMore) {
            $hasMore = false;
            foreach ($categories as $cat) {
                if (in_array($cat->parent_id, $categoryIds) && !in_array($cat->id, $categoryIds)) {
                    $categoryIds[] = $cat->id;
                    $hasMore = true;
                }
            }
        }

        return CategorySubmission::whereIn('category_id', $categoryIds)
            ->where('status', 'pending')
            ->get();
    }

    /**
     * Get approved submissions for a specific GN and Category (Public)
     */
    public function approved($_, array $args)
    {
        $categoryId = $args['category_id'];
        
        $categories = \App\Models\Category::all();
        $categoryIds = [$categoryId];
        
        $hasMore = true;
        while ($hasMore) {
            $hasMore = false;
            foreach ($categories as $cat) {
                if (in_array($cat->parent_id, $categoryIds) && !in_array($cat->id, $categoryIds)) {
                    $categoryIds[] = $cat->id;
                    $hasMore = true;
                }
            }
        }

        return CategorySubmission::whereIn('category_id', $categoryIds)
            ->where('gn_code', $args['gn_code'])
            ->where('status', 'approved')
            ->get();
    }

    /**
     * Get all submissions for a category, optionally filtered by status (Admin)
     */
    public function all($_, array $args)
    {
        $this->ensureSuperAdmin();
        $categoryId = $args['category_id'];
        
        $categories = \App\Models\Category::all();
        $categoryIds = [$categoryId];
        
        $hasMore = true;
        while ($hasMore) {
            $hasMore = false;
            foreach ($categories as $cat) {
                if (in_array($cat->parent_id, $categoryIds) && !in_array($cat->id, $categoryIds)) {
                    $categoryIds[] = $cat->id;
                    $hasMore = true;
                }
            }
        }

        $query = CategorySubmission::whereIn('category_id', $categoryIds);

        if (isset($args['status']) && $args['status'] !== '' && $args['status'] !== 'all') {
            $query->where('status', $args['status']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
