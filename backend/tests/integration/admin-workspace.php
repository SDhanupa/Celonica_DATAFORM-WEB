<?php
// All fixture writes go to disposable in-memory SQLite, never the configured application database.
$root = getenv('CEYLONICA_APP_ROOT') ?: dirname(__DIR__, 2);
require $root . '/vendor/autoload.php';
$app = require $root . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Http\Controllers\AdminWorkspaceController;
use App\Models\Admin;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
function check(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); }
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'database.connections.sqlite.url' => null]);
        DB::purge('sqlite');
        check(DB::getDriverName() === 'sqlite' && DB::connection()->getDatabaseName() === ':memory:', 'Refuse to test against stored data');
        foreach (['admins', 'users', 'questions', 'grama_niladharis'] as $name) {
            Schema::create($name, fn (Blueprint $table) => $table->id());
            DB::table($name)->insert(['id' => 1]);
        }
        Schema::create('categories', function (Blueprint $table) {
            $table->id(); $table->string('slug'); $table->string('name_en');
        });
        DB::table('categories')->insert([
            ['slug' => 'test', 'name_en' => 'Test collection'],
            ['slug' => 'empty', 'name_en' => 'Empty collection'],
        ]);
        foreach (['industry_surveys', 'category_submissions', 'village_topic_answers'] as $name) {
            Schema::create($name, function (Blueprint $table) { $table->id(); $table->string('status'); });
            DB::table($name)->insert([['status' => $name === 'industry_surveys' ? 'submitted' : 'pending'], ['status' => 'approved']]);
        }
        foreach (['category_data_test', 'category_data_empty'] as $name) {
            Schema::create($name, function (Blueprint $table) {
                $table->id(); $table->boolean('is_approved'); $table->boolean('is_update_proposal'); $table->string('private_note');
            });
        }
        DB::table('category_data_test')->insert([
            ['is_approved' => false, 'is_update_proposal' => true, 'private_note' => 'PRIVATE-TEST-RECORD'],
            ['is_approved' => true, 'is_update_proposal' => true, 'private_note' => 'PRIVATE-TEST-RECORD'],
            ['is_approved' => true, 'is_update_proposal' => false, 'private_note' => 'PRIVATE-TEST-RECORD'],
        ]);
$request = Request::create('/api/admin/workspace');
$request->attributes->set('current_admin', new Admin(['role' => 'super_admin']));
$before = DB::table('category_data_test')->get()->toJson();
$queries = [];
DB::listen(function ($query) use (&$queries) { $queries[] = $query->sql; });
$response = (new AdminWorkspaceController)->index($request);
$data = $response->getData(true);
check($data['totals']['categories'] === 2 && $data['totals']['users'] === 1, 'Counts must use actual rows');
check($data['totals']['industrySurveys'] === 2 && $data['queues']['industrySurveys'] === 1, 'Only submitted surveys are pending');
check($data['queues']['placeProposals'] === 2, 'OR conditions must not double count proposals');
check($data['collections'][0]['records'] === 0 && $data['collections'][1]['records'] === 3, 'Empty and populated collections must be distinct');
check(!str_contains($response->getContent(), 'PRIVATE-TEST-RECORD'), 'Only aggregate metadata may leave the endpoint');
check($before === DB::table('category_data_test')->get()->toJson(), 'Summary must preserve records');
foreach ($queries as $sql) check(!preg_match('/^\s*(insert|update|delete|drop|alter|create)\b/i', $sql), 'Summary must execute read queries only');
Schema::drop('questions');
check((new AdminWorkspaceController)->index($request)->getData(true)['totals']['questions'] === null, 'Missing data must not become zero');
foreach (['admin', 'moderator', 'user', null] as $role) {
    $denied = Request::create('/api/admin/workspace?current_admin[role]=super_admin');
    if ($role) $denied->attributes->set('current_admin', new Admin(['role' => $role]));
    try { (new AdminWorkspaceController)->index($denied); throw new RuntimeException('Access unexpectedly allowed'); }
    catch (Symfony\Component\HttpKernel\Exception\HttpException $error) { check($error->getStatusCode() === 403, 'Require super-admin access'); }
}
echo "PASS: real totals, queue semantics, empty/missing data, no personal records, read-only queries and access guards; disposable SQLite only.\n";
