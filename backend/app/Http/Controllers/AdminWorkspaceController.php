<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class AdminWorkspaceController extends Controller
{
    /** Aggregate metadata only: no records, credentials or write operations. */
    public function index(Request $request)
    {
        abort_unless($request->attributes->get('current_admin')?->role === 'super_admin', 403);

        $summary = DB::transaction(function () {
            if (DB::getDriverName() === 'pgsql') {
                DB::statement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY');
            }

            $count = static function (string $table, ?string $column = null, mixed $value = null): ?int {
                if (!Schema::hasTable($table)) return null;
                $query = DB::table($table);
                if ($column !== null) $query->where($column, $value);
                return $query->count();
            };

            $categories = Schema::hasTable('categories')
                ? DB::table('categories')->get(['slug', 'name_en'])->keyBy('slug')
                : collect();
            $tables = DB::getDriverName() === 'pgsql'
                ? array_map(fn ($row) => $row->tablename, DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
                : array_column(Schema::getTables(), 'name');
            $collections = [];
            foreach ($tables as $table) {
                if (!preg_match('/^category_data_[a-z0-9_]+$/D', $table)) continue;
                $slug = str_replace('_', '-', substr($table, strlen('category_data_')));
                $columns = Schema::getColumnListing($table);
                $pending = null;
                if (in_array('is_approved', $columns, true)) {
                    $query = DB::table($table)->where('is_approved', false);
                    if (in_array('is_update_proposal', $columns, true)) $query->orWhere('is_update_proposal', true);
                    $pending = $query->count();
                }
                $collections[] = [
                    'slug' => $slug,
                    'name' => $categories->get($slug)?->name_en ?? $slug,
                    'records' => DB::table($table)->count(),
                    'pending' => $pending,
                    // Only offer deep links understood by the existing category selector.
                    'manageable' => $categories->has($slug),
                ];
            }
            usort($collections, fn ($a, $b) => strcasecmp($a['name'], $b['name']));

            return [
                'totals' => [
                    'gnDivisions' => $count('grama_niladharis'),
                    'categories' => $count('categories'),
                    'questions' => $count('questions'),
                    'industrySurveys' => $count('industry_surveys'),
                    'users' => $count('users'),
                    'administrators' => $count('admins'),
                ],
                'queues' => [
                    'categoryResponses' => $count('category_submissions', 'status', 'pending'),
                    'gnAnswers' => $count('village_topic_answers', 'status', 'pending'),
                    'industrySurveys' => $count('industry_surveys', 'status', 'submitted'),
                    'placeProposals' => collect($collections)->contains(fn ($item) => $item['pending'] === null)
                        ? null : array_sum(array_column($collections, 'pending')),
                ],
                'collections' => $collections,
                'updatedAt' => now()->toIso8601String(),
            ];
        });

        return response()->json($summary)->header('Cache-Control', 'private, no-store');
    }
}
