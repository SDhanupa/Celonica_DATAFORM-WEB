<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$query = '
  query GetMe {
    me {
      id
      keycloakSub
      email
      name
      nic
      mobileNumber
      address
      dob
      gender
      role
      isActive
      lastLoginAt
      createdAt
    }
    meUser {
      id
      keycloakSub
      email
      name
      firstName
      lastName
      nic
      mobileNumber
      address
      dob
      gender
      createdAt
    }
    needsOnboarding
  }
';

$user = App\Models\User::first();
request()->merge(['current_user' => $user]);

$context = app(\Nuwave\Lighthouse\Support\Contracts\CreatesContext::class)->generate(request());

$res = app(\Nuwave\Lighthouse\GraphQL::class)->executeQueryString($query, $context, null);
echo json_encode($res, JSON_PRETTY_PRINT);
