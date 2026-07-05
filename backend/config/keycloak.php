<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Keycloak Configuration
    |--------------------------------------------------------------------------
    */
    'base_url'  => env('KEYCLOAK_BASE_URL', 'http://localhost:8080'),
    'realm'     => env('KEYCLOAK_REALM', 'celonica-admin'),
    'client_id' => env('KEYCLOAK_CLIENT_ID', 'celonica-frontend'),

    // Constructed JWKS endpoint
    'jwks_url'  => env('KEYCLOAK_BASE_URL', 'http://localhost:8080')
        . '/realms/'
        . env('KEYCLOAK_REALM', 'celonica-admin')
        . '/protocol/openid-connect/certs',

    // Admin API Credentials
    'admin_client_id'     => env('KEYCLOAK_ADMIN_CLIENT_ID', 'admin-cli'),
    'admin_client_secret' => env('KEYCLOAK_ADMIN_CLIENT_SECRET', ''),
];
