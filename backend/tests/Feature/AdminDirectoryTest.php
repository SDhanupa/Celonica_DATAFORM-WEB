<?php

namespace Tests\Feature;

use App\GraphQL\Queries\AdminQueries;
use App\Models\Admin;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Nuwave\Lighthouse\Schema\Types\Scalars\DateTime;
use Tests\TestCase;

class AdminDirectoryTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default'=>'sqlite', 'database.connections.sqlite.database'=>':memory:']);
        DB::purge('sqlite');
        Schema::create('admins', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('email');
            $table->string('role'); $table->timestamp('last_login_at')->nullable(); $table->timestamps();
        });
    }

    public function test_admin_directory_dates_can_be_serialized_by_graphql(): void
    {
        $admin = Admin::create(['name'=>'Test Admin', 'email'=>'test@example.test', 'role'=>'super_admin', 'last_login_at'=>'2026-10-25 12:00:00']);
        $request = Request::create('/graphql');
        $request->attributes->set('current_admin', $admin);
        $this->app->instance('request', $request);
        $rows = (new AdminQueries)->admins(null, []);
        $scalar = new DateTime;
        $this->assertCount(1, $rows);
        $this->assertSame('2026-10-25 12:00:00', $scalar->serialize($rows[0]->last_login_at));
        $this->assertIsString($scalar->serialize($rows[0]->created_at));
    }

    public function test_regular_admin_cannot_list_super_admin_directory(): void
    {
        $request = Request::create('/graphql');
        $request->attributes->set('current_admin', new Admin(['role'=>'admin']));
        $this->app->instance('request', $request);
        $this->expectException(\GraphQL\Error\Error::class);
        (new AdminQueries)->admins(null, []);
    }

    public function test_legacy_admin_with_missing_dates_remains_readable(): void
    {
        DB::table('admins')->insert(['name'=>'Legacy Admin', 'email'=>'legacy@example.test', 'role'=>'super_admin']);
        $request = Request::create('/graphql');
        $request->attributes->set('current_admin', Admin::firstOrFail());
        $this->app->instance('request', $request);
        config(['lighthouse.schema_cache.enable'=>false]);
        $schema=$this->app->make(\Nuwave\Lighthouse\Schema\SchemaBuilder::class)->schema();
        $context=new \Nuwave\Lighthouse\Execution\HttpGraphQLContext($request);
        $result=\GraphQL\GraphQL::executeQuery($schema, '{ admins { name createdAt updatedAt } }', null, $context)->toArray();
        $this->assertArrayNotHasKey('errors', $result, json_encode($result['errors'] ?? []));
        $this->assertSame(['name'=>'Legacy Admin','createdAt'=>null,'updatedAt'=>null], $result['data']['admins'][0]);
        $this->assertNull(DB::table('admins')->value('created_at'));
    }
}
