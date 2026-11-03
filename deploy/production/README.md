# Production hardening template — prepared locally, NOT deployed

No production server, DNS record, existing database, certificate or Git remote was changed. This template is deliberately separate from the loopback-only HTTPS rehearsal.

## Required before deployment

1. Identify the hosted app/auth domains, DNS control and certificate contact. Ports 80/443 must reach the public gateway for automatic ACME certificate issuance. No public certificate has been requested by this task.
2. Inventory and back up the existing database/identity/uploads/storage volumes. Fill their exact names in a private environment file; the template declares them external and will not quietly create empty replacements. Never run `down -v` or seed/reset the production database.
3. Retain the existing production `APP_KEY` and database credentials when preserving data. Changing POSTGRES_PASSWORD in Compose does not change passwords in existing PostgreSQL volumes. Plan credential rotation separately and validate dependent services together.
4. Build and test application images containing the final code and reviewed dependencies. Build frontend using this folder's Dockerfile with frontend/ as build context and HTTPS Keycloak URL plus the actual hosted realm/client as build arguments. Never bake secret environment files into images. The existing frontend .env.production contains historical realm/client names; explicit build arguments prevent accidental use of those values.
5. Select a maintained, patched Keycloak image and validate the custom SMS providers against it in an isolated copy of the identity database. This template uses modern hostname-v2 settings. The local rehearsal retains 24.0.3 for compatibility and verifies production startup mode only; that does not certify the old image for public deployment. Do not point a new Keycloak major at live data without a tested backup/upgrade plan.
6. Keep existing Keycloak realm/users/roles/flows. Configure its frontend client with only the correct HTTPS redirect/logout URLs and web origin. Preserve password+OTP requirements for administrators. Use a dedicated service account with only the required admin permissions. Replace any weak bootstrap/admin credentials through an approved private channel; do not use values from the development Compose file.
7. Put a fresh hosted Location API key in the integrating backend's secret store. Do not upload the local demo environment or reuse the key shared in chat. The local shared key has been revoked; production key state was not inspected or modified.

## Configuration behavior

- Only the gateway publishes ports, 80/443. PostgreSQL, Keycloak database, Redis, PHP-FPM, frontend upstream and Keycloak HTTP have no host port mappings.
- Gateway manages public HTTPS and HTTP redirects; internal service traffic remains on Docker networks. Its proxy overwrites forwarded headers. The database/cache network is internal.
- APP_ENV=production, APP_DEBUG=false, log level warning. No startup migration or seed is introduced.
- Keycloak uses `start`, strict HTTPS hostname and proxy headers, with edge TLS termination. Its admin/health/metrics routes are not exposed through the public auth gateway.
- Real secrets are required; there are no usable default database/admin passwords. `.env.example` contains intentionally invalid REQUIRED placeholders. A successful Compose render with placeholders is a structural check, not permission or readiness to deploy.
- Restrict infrastructure further using the hosting firewall; only intended web ports should be public. Apply OS and container security updates through a separate maintenance plan.

## Verification status

The standalone Compose template was rendered locally for structural validation only. It has not been started, its external volumes have not been opened, and its proposed Keycloak version/images have not been runtime tested. Public DNS/ACME issuance and hosted login/SMS/Google tests remain deployment work requiring a separately approved rollout.

The working local rehearsal uses https://localhost:8443 (web/API), https://localhost:8444 (login), https://localhost:8445 (GN demo), with a localhost-only certificate trusted by the current Windows account. It is not a public certificate or hosted deployment.
