<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class KeycloakAdminService
{
    protected $baseUrl;
    protected $realm;
    protected $clientId;
    protected $clientSecret;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('keycloak.base_url'), '/');
        $this->realm = config('keycloak.realm');
        $this->clientId = config('keycloak.admin_client_id');
        $this->clientSecret = config('keycloak.admin_client_secret');
    }

    /**
     * Get the Admin API access token.
     */
    protected function getAccessToken()
    {
        $response = Http::asForm()->post("{$this->baseUrl}/realms/{$this->realm}/protocol/openid-connect/token", [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'grant_type' => 'client_credentials',
        ]);

        if ($response->failed()) {
            throw new Exception('Failed to obtain Keycloak Admin Token: ' . $response->body());
        }

        return $response->json('access_token');
    }

    /**
     * Create a new user in Keycloak and set their password.
     */
    public function createUser(array $userData, string $password)
    {
        $token = $this->getAccessToken();

        $keycloakUserData = [
            'username' => $userData['email'], // Keycloak often requires username, we use email
            'email' => $userData['email'],
            'firstName' => $userData['firstName'] ?? '',
            'lastName' => $userData['lastName'] ?? '',
            'enabled' => true,
            'emailVerified' => true,
            'credentials' => [
                [
                    'type' => 'password',
                    'value' => $password,
                    'temporary' => false,
                ]
            ]
        ];

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/admin/realms/{$this->realm}/users", $keycloakUserData);

        if ($response->failed()) {
            throw new Exception('Failed to create user in Keycloak: ' . $response->body());
        }

        // Keycloak returns 201 Created and the location of the new user in headers
        $location = $response->header('Location');
        
        if (!$location) {
            // Fallback: search for the user if location header is not present
            return $this->getUserByEmail($userData['email'], $token);
        }
        
        $parts = explode('/', $location);
        return end($parts); // Returns the Keycloak User ID (sub)
    }

    /**
     * Fallback to get user ID by email.
     */
    public function getUserByEmail(string $email, string $token = null)
    {
        if (!$token) {
            $token = $this->getAccessToken();
        }

        $response = Http::withToken($token)
            ->get("{$this->baseUrl}/admin/realms/{$this->realm}/users", [
                'email' => $email,
                'exact' => 'true'
            ]);

        if ($response->failed() || empty($response->json())) {
            throw new Exception('Failed to retrieve user from Keycloak after creation.');
        }

        return $response->json()[0]['id'];
    }
}
