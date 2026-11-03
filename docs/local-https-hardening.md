# Local HTTPS setup — 2 November 2026

This configuration is running only on this computer. Nothing was pushed to Git or deployed to production. Existing database volumes, users, login flows and GN records were preserved.

## Open and start

- Website/API: https://localhost:8443
- Keycloak: https://localhost:8444
- GN Finder: https://localhost:8445
- Old website links on http://localhost:5174 redirect to HTTPS, preserving the path.

Start Docker Desktop, then run the repository's `start.ps1`. Its existing `-Rebuild` option now rebuilds the secure static frontend before starting the secure stack. Frontend source edits require this rebuild; Vite hot reload is intentionally not running in this configuration. The separate GN Finder app must also be started with its own `start.ps1` (Node 24+). Its API key remains in its private `.local/app.env`, outside this repository.

The root launcher selects all three Compose files when `.local/security.env` exists. Do not start the base Compose file alone: its development defaults are not the hardened configuration. `.local/security.env` sets `LOCAL_TLS_DIR` to the private certificate directory outside the web root. Do not delete that directory while using this stack.

## Changes and evidence

- All seven published Docker bindings use 127.0.0.1: ports 5174, 8443–8445, 3001, 5434 and 8081. Other database/cache/FPM services have no host ports. Internal HTTP and PostgreSQL ports remain available to local applications only; HTTPS is used at the browser/API edge.
- Runtime Laravel APP_ENV=production and APP_DEBUG=false, with warning-level logging.
- Keycloak 24.0.3 uses `start`, logs `Profile prod activated`, and advertises HTTPS issuer https://localhost:8444/realms/celonica-admin. This preserves compatibility with the existing SMS provider; production mode does not make this older version suitable for a new public deployment.
- The local frontend client's allowed login/logout redirects and web origin now use HTTPS port 8443. Existing sessions from HTTP may need a fresh sign-in. Users, roles and authentication flows were not changed. Full password/SMS/Google login was not repeated in this hardening pass; the HTTPS login page was verified. Google OAuth must allow the new callback `https://localhost:8444/realms/celonica-admin/broker/google/endpoint` if it is not already registered. No Google Console or other hosted provider setting was changed.
- The key shared in chat is revoked locally and returns HTTP 401. A replacement with the same GN-read scope and no expiry is stored only in the demo's private environment. HTTPS GN lookup returned RATPA for the Pahalagama example. Production key state was not inspected or changed.
- Five GN Finder tests passed, including trusted HTTPS origin acceptance, cross-origin rejection, key forwarding, error redaction, file isolation, rate limits and request validation. The secure frontend build passed.

## Local certificate

The certificate covers only localhost and 127.0.0.1, is trusted in the current Windows user's certificate store, and expires 2 November 2027. Its private key is outside the repository/web root in the chat workspace's `work/local-tls` directory, restricted to the current Windows user, SYSTEM and Administrators. It is not a public certificate. Other devices/accounts do not automatically trust it.

Before expiry, replace the certificate/key with a new localhost certificate using SAN localhost/127.0.0.1, serverAuth and CA:FALSE, preserve restricted file permissions, trust only the new localhost certificate in the current user's store, then reload the gateway. Remove the old trust entry only after successful verification. Never disable TLS verification to work around renewal. The currently installed certificate thumbprint is 3C5BD4FCC5A503ECDFA1830D315FC3FE1D736D4E.

## Before public hosting

Review `deploy/production/README.md`. That separate template was structurally validated only; it was not started. Public DNS/certificates, exact existing volume names, private credentials, reviewed images, a maintained Keycloak version compatible with the SMS provider, and full hosted login tests remain required before deployment. Do not upload the local private environment, TLS key, SSH PPK, database copies or local demo key. Existing application endpoints have not undergone a complete penetration test.
