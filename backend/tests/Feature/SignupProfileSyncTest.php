<?php

namespace Tests\Feature;

use App\GraphQL\Mutations\UserMutations;
use App\GraphQL\Queries\UserQueries;
use App\Models\User;
use App\Services\KeycloakAdminService;
use App\Services\SignupProfileSync;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SignupProfileSyncTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        DB::purge('sqlite');
        Schema::create('users', function (Blueprint $t) {
            $t->string('id',36)->primary();
            $t->string('name'); $t->string('email')->unique();
            $t->string('keycloak_sub')->nullable()->unique();
            $t->string('password')->nullable();
            $t->string('nic')->nullable()->unique(); $t->string('mobile_number')->nullable()->unique();
            $t->string('address')->nullable(); $t->date('dob')->nullable(); $t->string('gender')->nullable();
            $t->timestamps();
        });
    }

    private function service(array $attributes = [], string $email = 'signup@example.test'): SignupProfileSync
    {
        $api = \Mockery::mock(KeycloakAdminService::class);
        $api->shouldReceive('getUserProfile')->with('signup-sub')->andReturn([
            'id'=>'signup-sub', 'email'=>$email, 'firstName'=>'Signup', 'lastName'=>'Person', 'attributes'=>$attributes,
        ]);
        return new SignupProfileSync($api);
    }

    public function test_google_signup_details_are_reused_without_optional_fields_or_dummy_values(): void
    {
        $service=$this->service(['NIC'=>['199012345678'],'mobile_number'=>['0700000000']]);
        $user=$service->sync('signup-sub');
        $this->assertSame('Signup Person',$user->name);
        $this->assertSame('199012345678',$user->nic);
        $this->assertSame('0700000000',$user->mobile_number);
        foreach (['dob','gender','address'] as $field) $this->assertNull($user->$field);
        $this->assertSame($user->id,$service->sync('signup-sub')->id);
        $this->assertSame(1,User::count());
    }

    public function test_local_lowercase_nic_is_supported_and_missing_mobile_stays_null(): void
    {
        $user=$this->service(['nic'=>['901234567V']])->sync('signup-sub');
        $this->assertSame('901234567V',$user->nic);
        $this->assertNull($user->mobile_number);
    }

    public function test_unavailable_signup_profile_never_creates_a_placeholder_account(): void
    {
        $api=\Mockery::mock(KeycloakAdminService::class);
        $api->shouldReceive('getUserProfile')->with('signup-sub')->andThrow(new \RuntimeException('Unavailable'));
        try { (new SignupProfileSync($api))->sync('signup-sub'); $this->fail('Expected read failure'); }
        catch (\RuntimeException $e) { $this->assertSame(0,User::count()); }
    }

    public function test_sync_fills_only_missing_values_on_the_same_account(): void
    {
        $user=User::create(['name'=>'Existing Name','email'=>'signup@example.test','keycloak_sub'=>'signup-sub','nic'=>'880000000V','address'=>'Existing address']);
        $before=$user->fresh()->getAttributes();
        $result=$this->service(['NIC'=>['199012345678'],'mobile_number'=>['0700000000']])->sync('signup-sub');
        foreach (['id','name','email','keycloak_sub','nic','address'] as $field) $this->assertSame($before[$field],$result->$field);
        $this->assertSame('0700000000',$result->mobile_number);
    }

    public function test_matching_email_never_relinks_or_overwrites_existing_user(): void
    {
        $user=User::create(['name'=>'Existing','email'=>'signup@example.test','keycloak_sub'=>'other-sub']);
        $before=$user->fresh()->getAttributes();
        try { $this->service()->sync('signup-sub'); $this->fail('Expected account conflict'); }
        catch (\RuntimeException $e) { $this->assertStringContainsString('Unable to link',$e->getMessage()); }
        $this->assertSame($before,$user->fresh()->getAttributes());
        $this->assertSame(1,User::count());
    }

    public function test_duplicate_nic_rolls_back_without_changing_either_account(): void
    {
        User::create(['name'=>'Existing','email'=>'existing@example.test','nic'=>'199012345678']);
        $before=DB::table('users')->get()->toArray();
        try { $this->service(['NIC'=>['199012345678']])->sync('signup-sub'); $this->fail('Expected unique conflict'); }
        catch (\Illuminate\Database\QueryException $e) { $this->assertEquals($before,DB::table('users')->get()->toArray()); }
    }

    public function test_existing_account_can_sign_in_when_signup_phone_conflicts(): void
    {
        User::create(['name'=>'Other','email'=>'other@example.test','mobile_number'=>'0700000000']);
        $user=User::create(['name'=>'Existing','email'=>'signup@example.test','keycloak_sub'=>'signup-sub']);
        $before=DB::table('users')->orderBy('id')->get()->toArray();
        $result=$this->service(['NIC'=>['199012345678'],'mobile_number'=>['0700000000']])->sync('signup-sub');
        $this->assertSame($user->id,$result->id);
        $this->assertNull($result->nic);
        $this->assertNull($result->mobile_number);
        $this->assertEquals($before,DB::table('users')->orderBy('id')->get()->toArray());
    }

    public function test_existing_account_can_sign_in_when_profile_read_is_unavailable(): void
    {
        $user=User::create(['name'=>'Existing','email'=>'signup@example.test','keycloak_sub'=>'signup-sub']);
        $before=$user->fresh()->getAttributes();
        $api=\Mockery::mock(KeycloakAdminService::class);
        $api->shouldReceive('getUserProfile')->with('signup-sub')->andThrow(new \RuntimeException('Unavailable'));
        $result=(new SignupProfileSync($api))->sync('signup-sub');
        $this->assertSame($user->id,$result->id);
        $this->assertSame($before,$user->fresh()->getAttributes());
    }

    public function test_optional_profile_fields_can_be_cleared_without_touching_identity(): void
    {
        $user=User::create(['name'=>'Existing','email'=>'existing@example.test','nic'=>'199012345678','mobile_number'=>'0700000000','dob'=>'1990-01-01','gender'=>'Male','address'=>'Address']);
        $request=Request::create('/graphql','POST');$request->attributes->set('current_user',$user);
        $this->app->instance('request',$request);
        $result=$this->app->make(UserMutations::class)->updateUserProfile(null,['dob'=>'','gender'=>'','address'=>'']);
        foreach (['dob','gender','address'] as $field) $this->assertNull($result->fresh()->$field);
        $this->assertSame('199012345678',$result->nic);
        $this->assertSame('0700000000',$result->mobile_number);
        $this->assertFalse((new UserQueries)->needsOnboarding(null,[],null));
    }
}
