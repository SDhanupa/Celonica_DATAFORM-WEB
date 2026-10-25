<?php

namespace Tests\Feature;

use App\Http\Controllers\CategoryDataUploadController;
use App\Http\Controllers\PublicBusinessController;
use App\Models\Admin;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PublicDirectoryPrivacyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'cache.default' => 'array']);
        DB::purge('sqlite');
        Schema::create('categories', function (Blueprint $table) { $table->id(); $table->string('slug'); $table->integer('parent_id')->nullable(); });
        Schema::create('category_data_test', function (Blueprint $table) {
            $table->id(); $table->string('name_en'); $table->string('mobile');
            $table->string('nic'); $table->string('q_private'); $table->decimal('latitude');
            $table->boolean('is_approved');
        });
        DB::table('category_data_test')->insert([
            ['name_en'=>'Approved listing', 'mobile'=>'PRIVATE', 'nic'=>'PRIVATE', 'q_private'=>'PRIVATE', 'latitude'=>7.12, 'is_approved'=>true],
            ['name_en'=>'Pending listing', 'mobile'=>'PRIVATE', 'nic'=>'PRIVATE', 'q_private'=>'PRIVATE', 'latitude'=>7.13, 'is_approved'=>false],
        ]);
    }

    public function test_public_query_cannot_claim_admin_or_receive_private_fields(): void
    {
        $columns = Schema::getColumnListing('category_data_test');
        $rows = DB::table('category_data_test')->get();
        $request = Request::create('/api/category-data/test?is_admin=true&current_admin=1');
        $response = (new CategoryDataUploadController)->getData($request, 'test')->getData(true);
        $this->assertSame(1, $response['total']);
        $this->assertSame('Approved listing', $response['data'][0]['name_en']);
        foreach (['mobile', 'nic', 'q_private', 'latitude'] as $key) {
            $this->assertArrayNotHasKey($key, $response['data'][0]);
        }
        $this->assertSame($columns, Schema::getColumnListing('category_data_test'));
        $this->assertEquals($rows, DB::table('category_data_test')->get());
    }

    public function test_staff_cache_does_not_leak_to_public_requests(): void
    {
        $controller = new CategoryDataUploadController;
        $staff = Request::create('/api/category-data/test?is_admin=true');
        $staff->attributes->set('current_admin', new Admin(['role'=>'super_admin', 'is_active'=>true]));
        $private = $controller->getData($staff, 'test')->getData(true);
        $this->assertSame(2, $private['total']);
        $this->assertSame('PRIVATE', $private['data'][0]['mobile']);
        $public = $controller->getData(Request::create('/api/category-data/test?is_admin=true'), 'test')->getData(true);
        $this->assertSame(1, $public['total']);
        $this->assertStringNotContainsString('PRIVATE', json_encode($public));
        $staff->attributes->get('current_admin')->is_active = false;
        $this->assertSame($public, $controller->getData($staff, 'test')->getData(true));
    }

    public function test_business_profiles_require_approval_and_only_publish_listing_fields(): void
    {
        Schema::create('industry_surveys', function (Blueprint $table) {
            $table->id(); $table->string('reg_number'); $table->string('status');
            $table->string('ccode'); $table->text('form_data'); $table->timestamps();
        });
        foreach (['submitted', 'approved'] as $status) {
            DB::table('industry_surveys')->insert([
                'reg_number'=>$status, 'status'=>$status, 'ccode'=>'TEST',
                'form_data'=>json_encode(['formValues'=>['b_name'=>'Public shop', 'b_nic'=>'PRIVATE', 'b_owner_name'=>'PRIVATE', 'b_address'=>'PRIVATE', 'q_new_answer'=>'PRIVATE']]),
            ]);
        }
        $controller = new PublicBusinessController;
        $this->assertSame(404, $controller->show('submitted')->getStatusCode());
        $profile = $controller->show('approved')->getData(true);
        $this->assertSame(['b_name'=>'Public shop'], $profile['form_values']);
        $list = $controller->byCcode('TEST')->getData(true);
        $this->assertCount(1, $list);
        $this->assertStringNotContainsString('PRIVATE', json_encode($list));
    }

    public function test_graphql_public_submission_projection_preserves_stored_answers(): void
    {
        Schema::create('category_submissions', function (Blueprint $table) {
            $table->string('id')->primary(); $table->integer('category_id');
            $table->string('user_id'); $table->string('status'); $table->text('answers_data');
            $table->decimal('latitude'); $table->decimal('longitude'); $table->timestamps();
        });
        DB::table('category_submissions')->insert([
            'id'=>'test-submission', 'category_id'=>99, 'user_id'=>'PRIVATE', 'status'=>'approved',
            'latitude'=>7.12, 'longitude'=>80.2,
            'answers_data'=>json_encode(['Name (EN)'=>'Public listing', 'Mobile'=>'PRIVATE', 'Personal answer'=>'PRIVATE']),
        ]);
        $before = DB::table('category_submissions')->first();
        $this->app->instance('request', Request::create('/graphql'));
        $result = (new \App\GraphQL\Queries\CategorySubmissionQueries)->approved(null, ['category_id'=>99, 'gn_code'=>null]);
        $this->assertCount(1, $result);
        $this->assertNull($result[0]->user_id);
        $this->assertNull($result[0]->user);
        $this->assertNull($result[0]->latitude);
        $this->assertNull($result[0]->longitude);
        $this->assertSame(['Name (EN)'=>'Public listing'], json_decode($result[0]->answers_data, true));
        $this->assertEquals($before, DB::table('category_submissions')->first());
    }
}
