<?php

namespace Tests\Feature;

use App\GraphQL\Mutations\UserMutations;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserIdGenerationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        DB::purge('sqlite');
    }

    private function createUsersTable(bool $numeric = false): void
    {
        Schema::create('users', function (Blueprint $table) use ($numeric): void {
            if ($numeric) {
                $table->id();
            } else {
                $table->string('id', 36)->primary();
            }
            $table->string('name');
            $table->string('email')->unique();
            $table->string('keycloak_sub')->nullable()->unique();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('nic')->nullable();
            $table->string('mobile_number')->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
        });
    }

    public function test_string_ids_are_generated_and_preserved_on_reload_and_update(): void
    {
        $this->createUsersTable();
        $first = User::create(['name' => 'First Test', 'email' => 'first@example.test']);
        $second = User::create(['name' => 'Second Test', 'email' => 'second@example.test']);
        $this->assertTrue(Str::isUuid($first->getKey()));
        $this->assertNotSame($first->getKey(), $second->getKey());
        $reloaded = User::findOrFail($first->getKey());
        $this->assertSame($first->getKey(), $reloaded->getKey());
        $reloaded->update(['name' => 'Updated Test']);
        $this->assertSame($first->getKey(), $reloaded->fresh()->getKey());
        $this->assertSame('Second Test', $second->fresh()->name);

        $explicit = new User(['name' => 'Explicit Test', 'email' => 'explicit@example.test']);
        $explicit->id = '019fd609-b2a9-72b5-8373-5867f1962ce9';
        $explicit->save();
        $this->assertSame('019fd609-b2a9-72b5-8373-5867f1962ce9', $explicit->fresh()->getKey());
    }

    public function test_numeric_database_ids_still_auto_increment(): void
    {
        $this->createUsersTable(true);
        $first = User::create(['name' => 'Numeric Test', 'email' => 'numeric1@example.test']);
        $second = User::create(['name' => 'Numeric Test', 'email' => 'numeric2@example.test']);
        $this->assertSame('1', (string) $first->getKey());
        $this->assertSame('2', (string) $second->fresh()->getKey());
    }

    public function test_new_identity_sync_creates_one_user_and_preserves_existing_accounts(): void
    {
        $this->createUsersTable();
        $existing = User::create(['name' => 'Existing Test', 'email' => 'existing@example.test', 'keycloak_sub' => 'existing-sub']);
        $before = DB::table('users')->where('id', $existing->getKey())->first();
        $request = Request::create('/graphql', 'POST');
        foreach (['keycloak_sub' => 'new-google-sub', 'keycloak_email' => 'new-google@example.test', 'keycloak_first_name' => 'Google', 'keycloak_last_name' => 'Test'] as $key => $value) {
            $request->attributes->set($key, $value);
        }
        $this->app->instance('request', $request);
        $mutation = $this->app->make(UserMutations::class);
        $new = $mutation->syncUser(null, []);
        $this->assertInstanceOf(User::class, $new);
        $this->assertTrue(Str::isUuid($new->getKey()));
        $this->assertSame($new->getKey(), $mutation->syncUser(null, [])->getKey());
        $this->assertSame(2, User::count());
        $this->assertEquals($before, DB::table('users')->where('id', $existing->getKey())->first());
    }
}
