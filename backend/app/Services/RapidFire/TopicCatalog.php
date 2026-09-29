<?php

namespace App\Services\RapidFire;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * The playable rapid-fire topics: every leaf category, grouped into decks by
 * top-level category, minus the roots configured as not answerable from memory.
 */
class TopicCatalog
{
    private const CACHE_KEY = 'rapid_fire_catalog_v1';
    private const CACHE_SECONDS = 600;

    /** @var array{byId: array<int, object>, children: array<int, int[]>}|null */
    private ?array $tree = null;

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /** Top-level categories that can be played, in curated order. */
    public function decks(): Collection
    {
        $excluded = config('rapid_fire.excluded_root_slugs', []);

        return collect($this->tree()['byId'])
            ->filter(fn ($c) => $c->parent_id === null && !in_array($c->slug, $excluded, true))
            ->sortBy('sort_order')
            ->values();
    }

    public function deckBySlug(string $slug): ?object
    {
        return $this->decks()->firstWhere('slug', $slug);
    }

    /** @return int[] leaf category ids under a deck root */
    public function leafIdsUnder(int $rootId): array
    {
        $children = $this->tree()['children'];
        $leaves = [];
        $stack = [$rootId];
        $seen = [];

        while ($stack) {
            $id = array_pop($stack);
            if (isset($seen[$id])) {
                continue; // defends against a cycle in hand-edited data
            }
            $seen[$id] = true;

            if (empty($children[$id])) {
                if ($id !== $rootId) {
                    $leaves[] = $id;
                }
                continue;
            }
            foreach ($children[$id] as $child) {
                $stack[] = $child;
            }
        }

        return $leaves;
    }

    /** @return int[] every playable leaf id */
    public function allPlayableLeafIds(): array
    {
        return $this->decks()->flatMap(fn ($deck) => $this->leafIdsUnder($deck->id))->values()->all();
    }

    /** The card a player sees for one topic. */
    public function cardFor(int $categoryId): ?array
    {
        $byId = $this->tree()['byId'];
        $topic = $byId[$categoryId] ?? null;
        if (!$topic) {
            return null;
        }

        $parent = $topic->parent_id ? ($byId[$topic->parent_id] ?? null) : null;
        $root = $topic;
        $guard = 0;
        while ($root->parent_id && isset($byId[$root->parent_id]) && $guard++ < 25) {
            $root = $byId[$root->parent_id];
        }

        return [
            'id' => $topic->id,
            'slug' => $topic->slug,
            'path' => $this->pathSlugs($topic),
            'name_en' => self::displayName($topic->name_en),
            'name_si' => self::displayName($topic->name_si),
            'name_ta' => self::displayName($topic->name_ta),
            'context_en' => $parent && $parent->id !== $root->id ? self::displayName($parent->name_en) : null,
            'context_si' => $parent && $parent->id !== $root->id ? self::displayName($parent->name_si) : null,
            'context_ta' => $parent && $parent->id !== $root->id ? self::displayName($parent->name_ta) : null,
            'deck_slug' => $root->slug,
            'deck_name_en' => $root->name_en,
        ];
    }

    /**
     * Many topic names carry a classification code ("1633 - Crop Grading",
     * "A1 - …"). The code means nothing to a resident answering in two seconds.
     */
    public static function displayName(?string $name): ?string
    {
        if ($name === null) {
            return null;
        }
        $clean = preg_replace('/^\s*[A-Za-z]{0,3}\d+(?:\.\d+)*[a-z]?\s*[-–:.]\s*/u', '', $name);

        return trim($clean) !== '' ? trim($clean) : trim($name);
    }

    /** Slug path from the deck root, as the contribute pages route it. */
    private function pathSlugs(object $topic): string
    {
        $byId = $this->tree()['byId'];
        $slugs = [$topic->slug];
        $node = $topic;
        $guard = 0;
        while ($node->parent_id && isset($byId[$node->parent_id]) && $guard++ < 25) {
            $node = $byId[$node->parent_id];
            array_unshift($slugs, $node->slug);
        }

        return implode('/', $slugs);
    }

    private function tree(): array
    {
        if ($this->tree !== null) {
            return $this->tree;
        }

        $rows = Cache::remember(self::CACHE_KEY, self::CACHE_SECONDS, fn () => DB::table('categories')
            ->get(['id', 'parent_id', 'slug', 'name_en', 'name_si', 'name_ta', 'sort_order'])
            ->map(fn ($r) => [
                'id' => (int) $r->id,
                'parent_id' => $r->parent_id === null ? null : (int) $r->parent_id,
                'slug' => $r->slug,
                'name_en' => $r->name_en,
                'name_si' => $r->name_si,
                'name_ta' => $r->name_ta,
                'sort_order' => (int) $r->sort_order,
            ])
            ->all());

        $byId = [];
        $children = [];
        foreach ($rows as $row) {
            $byId[$row['id']] = (object) $row;
            if ($row['parent_id'] !== null) {
                $children[$row['parent_id']][] = $row['id'];
            }
        }

        return $this->tree = ['byId' => $byId, 'children' => $children];
    }
}
