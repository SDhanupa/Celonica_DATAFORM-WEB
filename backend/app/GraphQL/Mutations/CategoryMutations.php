<?php

namespace App\GraphQL\Mutations;

use App\Models\Category;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CategoryMutations
{
    private function ensureSuperAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin || !in_array($admin->role, ['super_admin'])) {
            throw new \GraphQL\Error\Error('Super Admin access required');
        }
    }

    public function createCategory($_, array $args)
    {
        $this->ensureSuperAdmin();
        // Check for duplicate name
        $nameEn = $args['name_en'] ?? '';
        $nameSi = $args['name_si'] ?? '';
        $nameTa = $args['name_ta'] ?? '';
        
        $parentId = $args['parent_id'] ?? null;
        
        $query = Category::where('parent_id', $parentId)->where(function($q) use ($nameEn, $nameSi, $nameTa) {
            $q->where('name_en', $nameEn);
            if (!empty($nameSi)) {
                $q->orWhere('name_si', $nameSi);
            }
            if (!empty($nameTa)) {
                $q->orWhere('name_ta', $nameTa);
            }
        });
        
        if ($query->exists()) {
            throw new \GraphQL\Error\Error("Same category already added in this section");
        }

        // Auto generate unique slug tag
        $args['slug'] = \Illuminate\Support\Str::slug($nameEn) . '-' . uniqid();

        return Category::create($args);
    }

    public function updateCategory($_, array $args)
    {
        $this->ensureSuperAdmin();
        $category = Category::findOrFail($args['id']);
        if (array_key_exists('name_en', $args) && is_null($args['name_en'])) {
            $args['name_en'] = '';
        }
        if (array_key_exists('name_si', $args) && is_null($args['name_si'])) {
            $args['name_si'] = '';
        }
        if (array_key_exists('name_ta', $args) && is_null($args['name_ta'])) {
            $args['name_ta'] = '';
        }
        $category->update($args);
        return $category;
    }

    public function deleteCategory($_, array $args)
    {
        $this->ensureSuperAdmin();
        $category = Category::findOrFail($args['id']);
        $category->delete();
        return true;
    }
}
