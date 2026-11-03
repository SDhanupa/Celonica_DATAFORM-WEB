<?php

namespace Tests\Feature;

use App\Http\Middleware\GraphqlRequestBudget;
use App\Http\Middleware\SuperAdminMiddleware;
use App\Models\Admin;
use App\Services\KeycloakTokenVerifier;
use App\Services\OtpService;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SecurityRegressionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.default' => 'array']);
        Cache::flush();
    }

    public function test_super_admin_guard_checks_role_and_account_state(): void
    {
        foreach (['admin', 'moderator', 'super_admin', null] as $role) {
            foreach ([true, false] as $active) {
                $request = Request::create('/api/admins?current_admin[role]=super_admin');
                if ($role) $request->attributes->set('current_admin', new Admin(['role' => $role, 'is_active' => $active]));
                $response = (new SuperAdminMiddleware)->handle($request, fn () => response('allowed'));
                $this->assertSame($role === 'super_admin' && $active ? 200 : 403, $response->getStatusCode());
            }
        }
    }

    public function test_access_tokens_require_resource_audience_client_type_signature_and_expiry(): void
    {
        config(['keycloak.public_url' => 'https://identity.test', 'keycloak.realm' => 'test', 'keycloak.client_id' => 'web', 'keycloak.audience' => 'api']);
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $private);
        $rsa = openssl_pkey_get_details($key)['rsa'];
        $encode = fn ($s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
        Cache::put('keycloak_jwks', ['keys' => [['kty' => 'RSA', 'kid' => 'fixture', 'alg' => 'RS256', 'n' => $encode($rsa['n']), 'e' => $encode($rsa['e'])]]]);
        $claims = ['iss' => 'https://identity.test/realms/test', 'sub' => 'fixture-user', 'aud' => ['account', 'api'], 'azp' => 'web', 'typ' => 'Bearer', 'iat' => time() - 1, 'exp' => time() + 300];
        $verifier = new KeycloakTokenVerifier;
        $this->assertSame('fixture-user', $verifier->verify(JWT::encode($claims, $private, 'RS256', 'fixture'))->sub);
        foreach ([['aud' => 'other'], ['azp' => 'other'], ['typ' => 'ID'], ['iss' => 'https://other.test'], ['exp' => time() - 10], ['exp' => null], ['sub' => '']] as $invalid) {
            try {
                $verifier->verify(JWT::encode(array_replace($claims, $invalid), $private, 'RS256', 'fixture'));
                $this->fail('Invalid token accepted: ' . json_encode($invalid));
            } catch (\RuntimeException|\UnexpectedValueException $error) {
                $this->assertNotEmpty($error->getMessage());
            }
        }
        $other = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($other, $wrongPrivate);
        $this->expectException(\UnexpectedValueException::class);
        $verifier->verify(JWT::encode($claims, $wrongPrivate, 'RS256', 'fixture'));
    }

    public function test_otp_has_no_bypass_and_is_single_use_with_attempt_limit(): void
    {
        config(['app.env' => 'local']);
        $otp = new OtpService;
        $this->assertMatchesRegularExpression('/^[0-9]{8}$/', $otp->generateOtp());
        $this->assertFalse($otp->validateOtp('unknown', '00000000'));
        $otp->storeOtp('valid', '12345678');
        $this->assertNotSame('12345678', Cache::get('otp_' . md5('valid')));
        $this->assertTrue($otp->validateOtp('valid', '12345678'));
        $this->assertFalse($otp->validateOtp('valid', '12345678'));
        $otp->storeOtp('limited', '12345678');
        for ($i = 0; $i < 5; $i++) $this->assertFalse($otp->validateOtp('limited', '11111111'));
        $this->assertFalse($otp->validateOtp('limited', '12345678'));
        $otp->storeOtp('expired', '12345678');
        $this->travel(6)->minutes();
        $this->assertFalse($otp->validateOtp('expired', '12345678'));
    }

    public function test_sms_cooldown_cannot_be_bypassed_by_phone_format_or_login_flow(): void
    {
        $otp = new OtpService;
        $otp->reserveSend('fixture-a', '0700000000');
        $this->expectException(\GraphQL\Error\Error::class);
        $otp->reserveSend('fixture-b', '+94700000000');
    }

    public function test_graphql_budget_rejects_batches_oversized_and_excessive_requests(): void
    {
        $guard = new GraphqlRequestBudget;
        $next = fn () => response('allowed');
        $request = fn ($body) => Request::create('/graphql', 'POST', [], [], [], ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '192.0.2.1'], $body);
        $this->assertSame(400, $guard->handle($request('[{"query":"{__typename}"}]'), $next)->getStatusCode());
        $this->assertSame(400, $guard->handle($request(str_repeat('x', 65537)), $next)->getStatusCode());
        Cache::flush();
        for ($i = 0; $i < 120; $i++) $this->assertSame(200, $guard->handle($request('{"query":"{__typename}"}'), $next)->getStatusCode());
        $this->assertSame(429, $guard->handle($request('{"query":"{__typename}"}'), $next)->getStatusCode());
        $this->travel(61)->seconds();
        $this->assertSame(200, $guard->handle($request('{"query":"{__typename}"}'), $next)->getStatusCode());
    }

    public function test_directory_pagination_fits_budget_but_unbounded_queries_do_not(): void
    {
        $schema = app(\Nuwave\Lighthouse\Schema\SchemaBuilder::class)->schema();
        $queries = json_decode(file_get_contents(__DIR__ . '/../Fixtures/security-directory-queries.json'), true);
        foreach ($queries as $query) {
            $ast = \GraphQL\Language\Parser::parse($query);
            $rule = new \GraphQL\Validator\Rules\QueryComplexity(config('lighthouse.security.max_query_complexity'));
            $rule->setRawVariableValues(['first' => 100, 'page' => 1]);
            $errors = \GraphQL\Validator\DocumentValidator::validate($schema, $ast, [$rule]);
            $this->assertSame([], $errors, 'Existing 100-row directory pages must remain usable.');
            $this->assertGreaterThan(100, $rule->getQueryComplexity());
            $rule->setRawVariableValues(['first' => 100000, 'page' => 1]);
            $this->assertNotEmpty(\GraphQL\Validator\DocumentValidator::validate($schema, $ast, [$rule]));
        }
    }
}
