<?php

namespace App\GraphQL\Queries;

use App\Models\Category;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CategoryQueries
{
    public function categories($rootValue, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        // Get all root categories (parent_id is null) ordered by sort_order
        return Category::whereNull('parent_id')->orderBy('sort_order')->get();
    }

    public function categoryBySlug($rootValue, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        return Category::where('slug', $args['slug'])->first();
    }

    public function progress(Category $category, array $args, GraphQLContext $context, ResolveInfo $resolveInfo)
    {
        $user = request()->get('current_user');
        if (!$user) {
            return 0; // Admins or guests see 0 progress
        }

        // Get all questions under this category (and its subcategories ideally, but for now just this category)
        // Wait, if it's a parent category, we should count all questions in all its subcategories.
        $categoryIds = $this->getAllCategoryIds($category);

        $totalQuestions = \App\Models\Question::whereIn('category_id', $categoryIds)
            ->where('is_active', true)
            ->count();

        if ($totalQuestions === 0) {
            return 100; // If no questions, it's 100% complete
        }

        $answeredQuestions = \App\Models\UserAnswer::where('user_id', $user->id)
            ->whereHas('question', function ($q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds)
                  ->where('is_active', true);
            })
            // A user might have multiple iterations of the same question, but we just care if they answered AT LEAST ONE iteration.
            // Distinct question_id gives us the count of unique questions answered.
            ->distinct('question_id')
            ->count('question_id');

        return ($answeredQuestions / $totalQuestions) * 100;
    }

    private function getAllCategoryIds(Category $category)
    {
        $ids = [$category->id];
        foreach ($category->children as $child) {
            $ids = array_merge($ids, $this->getAllCategoryIds($child));
        }
        return $ids;
    }
}
