# Production deployment and hardening

The Caddy Compose template in this directory is an alternative layout and has not been applied to the existing hosted installation. The hosted installation uses the root Compose file plus private release overrides. Do not replace its volumes or apply this alternative template over the live stack.

The 2026-11-03 security release rotates exposed credentials, restricts internal ports to loopback, blocks public Keycloak administration, and upgrades Keycloak to 26.8.1. The identity upgrade uses a verified copy of the existing database; the original remains available for rollback. Use the private current runtime configuration when changing images: old Git revisions contain revoked credentials.

Application startup performs no application database migrations, imports, resets, or seeds. Keycloak schema upgrades must first be rehearsed against a separate identity database copy. Account and credential preservation checks are required before completing the cutover.

## Required before deployment

1. Identify the hosted app/auth domains, DNS control and certificate contact. Ports 80/443 must reach the public gateway for automatic ACME certificate issuance. No public certificate has been requested by this task.
2. Inventory and back up the existing database/identity/uploads/storage volumes. Fill their exact names in a private environment file; the template declares them external and will not quietly create empty replacements. Never run `down -v` or seed/reset the production database.
3. Use the current rotated credentials from the private runtime configuration. Changing POSTGRES_PASSWORD in Compose does not change passwords in existing PostgreSQL volumes. Rotate PostgreSQL roles and their clients together. Before rotating APP_KEY, check encrypted data and legacy derived proxy passwords; never blindly generate a replacement key for an existing installation.
4. Build and test application images containing the final code and reviewed dependencies. Build frontend using this folder's Dockerfile with frontend/ as build context and HTTPS Keycloak URL plus the actual hosted realm/client as build arguments. Never bake secret environment files into images. The existing frontend .env.production contains historical realm/client names; explicit build arguments prevent accidental use of those values.
5. Build the maintained Keycloak image using `keycloak/Dockerfile` with `keycloak/` as the context. The custom providers target 26.8.1. This version was rehearsed with an isolated copy of the hosted identity database. Local startup backs up a detected 24.x identity database before upgrading it. Do not point a new major version at live data without a tested backup/upgrade plan.
6. Keep existing Keycloak realm/users/roles/flows. Configure its frontend client with only the correct HTTPS redirect/logout URLs and web origin. Preserve password+OTP requirements for administrators. Use a dedicated service account with only the required admin permissions. Replace any weak bootstrap/admin credentials through an approved private channel; do not use values from the development Compose file.
7. Put a fresh hosted Location API key in the integrating backend's secret store. Do not upload the local demo environment or reuse a key shared in chat. Verification keys must expire quickly and be revoked after the checks, preserving their audit record.

## Configuration behavior

- Only the gateway publishes ports, 80/443. PostgreSQL, Keycloak database, Redis, PHP-FPM, frontend upstream and Keycloak HTTP have no host port mappings.
- Gateway manages public HTTPS and HTTP redirects; internal service traffic remains on Docker networks. Its proxy overwrites forwarded headers. The database/cache network is internal.
- APP_ENV=production, APP_DEBUG=false, log level warning. No startup migration or seed is introduced.
- Keycloak uses `start`, strict HTTPS hostname and proxy headers, with edge TLS termination. Its admin/health/metrics routes are not exposed through the public auth gateway.
- Real secrets are required; there are no usable default database/admin passwords. `.env.example` contains intentionally invalid REQUIRED placeholders. A successful Compose render with placeholders is a structural check, not permission or readiness to deploy.
- Restrict infrastructure further using the hosting firewall; only intended web ports should be public. Apply OS and container security updates through a separate maintenance plan.

## Authentication configuration

The frontend client must have an OpenID Connect audience mapper adding `ceylonica-api` to access tokens (not ID tokens). Configure `KEYCLOAK_API_AUDIENCE` and the actual frontend `KEYCLOAK_CLIENT_ID` consistently. The API checks issuer, signature, expiry, audience, authorized party and Bearer token type. Existing sessions may need to sign in again after changing the mapper. Keep direct password grants disabled on the hosted browser client so they cannot bypass the browser's administrator SMS flow.

Trust forwarding headers only from the configured Docker proxy subnet. The public edge must overwrite client-supplied forwarding headers. Production GraphQL has request, depth and complexity limits; the complexity budget preserves the existing 100-row directory pages. Never log SMS codes, bearer keys or gateway credentials.

## Standalone template status

The standalone Caddy Compose template was rendered for structural validation only. It has not been started and its external volumes have not been opened. The existing hosted release reuses its HTTPS edge and certificates. Real-user SMS/Google sign-in requires an interactive verification after any identity upgrade; automated API/provider checks do not substitute for that check.

The working local rehearsal uses https://localhost:8443 (web/API), https://localhost:8444 (login), https://localhost:8445 (GN demo), with a localhost-only certificate trusted by the current Windows account. It is not a public certificate or hosted deployment.
