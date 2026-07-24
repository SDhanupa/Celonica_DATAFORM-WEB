<?php

namespace App\GraphQL\Mutations;

use App\Models\Category;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CategoryMutations
{
    public function createCategory($_, array $args)
    {
        // Check for duplicate name
        $nameEn = $args['name_en'] ?? '';
        $nameSi = $args['name_si'] ?? '';
        
        if (Category::where('name_en', $nameEn)->orWhere('name_si', $nameSi)->exists()) {
            throw new \Exception("Same button already added");
        }

        // Auto generate unique slug tag
        $args['slug'] = \Illuminate\Support\Str::slug($nameEn) . '-' . uniqid();

        return Category::create($args);
    }

    public function updateCategory($_, array $args)
    {
        $category = Category::findOrFail($args['id']);
        if (array_key_exists('name_en', $args) && is_null($args['name_en'])) {
            $args['name_en'] = '';
        }
        if (array_key_exists('name_si', $args) && is_null($args['name_si'])) {
            $args['name_si'] = '';
        }
        $category->update($args);
        return $category;
    }

    public function deleteCategory($_, array $args)
    {
        $category = Category::findOrFail($args['id']);
        $category->delete();
        return true;
    }
}
