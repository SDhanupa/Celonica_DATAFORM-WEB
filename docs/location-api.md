# GN Location API

Local admin panel: https://localhost:8443/admins?view=api

Super administrators can create a key for each integrating project's backend, choose Never expires or a 7/30/90 day lifetime, see its prefix/status/usage and revoke it. Change expiry preserves the same secret for active keys; timed durations start when saved. Expired or revoked keys cannot be reactivated by changing expiry. Raw keys are shown once, kept in UI memory until dismissal, and stored only as SHA-256 hashes in the database. There is no recovery endpoint. Replace a lost key and revoke the old one.

Never expires means no automatic expiry, not immunity from theft. A copied key allows GN reads and can consume that key's quota until revocation. Keep it on a trusted backend and revoke it if exposed.

## Connect another project

Use the other project's backend to call Ceylonica. Keep the key in a server environment variable named `CEYLONICA_API_KEY`; never embed it in a Flutter app, JavaScript bundle, URL or Git repository. A mobile app should call its own authenticated backend, which applies its own user access and rate limits.

Base URL for this computer: `https://localhost:8443/api/v1`. Hosted base URL: `https://ceystem.com/api/v1` after deployment. Another computer or phone cannot reach this computer by calling its own localhost. Keep API keys on the integrating backend, and use HTTPS directly rather than following an HTTP redirect with credentials.

All requests use headers:

```http
Authorization: Bearer <your-api-key>
Accept: application/json
```

```sh
curl "https://localhost:8443/api/v1/gn/RATPA" \
  -H "Authorization: Bearer $CEYLONICA_API_KEY" \
  -H "Accept: application/json"

curl "https://localhost:8443/api/v1/locations/resolve?lat=8.18786845&lng=80.28274755" \
  -H "Authorization: Bearer $CEYLONICA_API_KEY" \
  -H "Accept: application/json"
```

The example coordinates are a point calculated inside the stored Pahalagama boundary, not a person's GPS location.

## Contract

- `GET /gn/{code}` accepts the project's CCODE (e.g. `RATPA`) or official code (e.g. `LK7145015`), case-insensitively. Names are not identifiers.
- `GET /locations/resolve?lat={latitude}&lng={longitude}` accepts numeric latitude [-90,90] and longitude [-180,180]. It uses stored boundary polygons with hole exclusion and exact official-code mapping. It makes no external geocoder requests. Ambiguous, uncovered or unmapped locations return 404.

The GN endpoint returns `{ "data": { "ccode", "code", "name": {"en","si","ta"}, "province": {"code","ccode","name"}, "district": {"code","ccode","name"}, "division": {"code","ccode","name"}, "village_path" } }`. Each hierarchy name has the same three language keys; unavailable fields are null. Values reflect the existing database and are not corrected or invented by the API. `village_path` is relative to the Ceylonica website.

Coordinate lookup wraps that same GN object in `{ "data": { "coordinates": { "latitude", "longitude" }, "match": "boundary", "gn": { ... } } }`. Coordinates are echoed inputs, not an administrative centroid. Polygon datasets can have coverage or mapping gaps; a match is not proof of legal boundaries or GPS accuracy.

Errors are JSON with a `message`: 401 missing/invalid/expired/revoked key; 403 scope denied; 404 no unique match; 422 invalid input (with Laravel field errors); 429 request limit. Use the `Retry-After` seconds header on 429. The partner routes are limited to 60 requests/minute/key and 180/minute/source IP. Limits share Redis across local API replicas. Responses are not publicly cacheable.

Keys have the fixed `gn:read` scope and cannot authorize admin endpoints, record mutations, household data, survey records or personal details. Existing public website/GraphQL access remains unchanged; this feature does not make previously public GN data private. Only access-key usage metadata (count and last-used time) is stored by this integration. Existing web-server access logs may contain request URLs; review log policy when deploying location services.

## Admin routes

All require the existing Keycloak login plus an active database `super_admin` role:

- `GET /api/admin/location-api/keys`: metadata only, never a secret or hash.
- `POST /api/admin/location-api/keys`: JSON `{ "name": "Plant Mobile App backend", "expires_in_days": 30 }`; 201 includes `data` and one-time `secret`.
- `PATCH /api/admin/location-api/keys/{id}/expiry`: JSON `{ "expires_in_days": 0 }` for Never expires, or 7/30/90. Requires an active, unrevoked key. Returns metadata only. Missing/null/unsupported duration is rejected; permanent access must be explicit.
- `POST /api/admin/location-api/keys/{id}/revoke`: immediate revocation for subsequent requests. A request already executing may finish.
- `GET /api/admin/location-api/preview?code=RATPA` or `?lat=...&lng=...`: same lookup with an admin session.

Temporary integration-test keys are rolled back. User-created keys are retained. Database/API metadata uses `expires_at: null` for Never expires; revocation still takes precedence.

## Deployment (not performed)

Deploy backend and frontend changes together. On the target environment, review and run only this additive migration:

```sh
php artisan migrate --path=database/migrations/2026_11_02_160000_create_location_api_keys_table.php --force
php artisan migrate --path=database/migrations/2026_11_02_170000_allow_non_expiring_location_api_keys.php --force
```

The first migration creates `location_api_keys`; the second allows a nullable expiry without altering existing expiry values. Neither updates GN/content tables. The nullable-expiry rollback refuses to run while any null expiry exists, to avoid inventing dates or deleting keys. Do not roll back the original table-creation migration after real keys exist unless you intend to remove those keys. Keep the normal database backup process.

Serve the API through HTTPS, forward Authorization to Laravel, retain shared Redis/cache and rebuild route caches if your deployment caches routes. Generate separate keys on the hosted environment; do not ship local keys, private environment files or database dumps with source assets. The frontend-only hosting archive from earlier work is not a deployment of this API.

## Verification

`backend/tests/integration/location-api.php` boots Laravel then switches to SQLite memory before fixture writes. It covers hashing/secrecy, role checks and client identity spoofing, expiry/revocation, scope, rate limiting, coordinate validation, polygon holes/shared edges, missing codes and a response field allowlist.

It also covers non-expiring key creation, expiry updates without key replacement, rejected reactivation, and invalid-token throttling: the 181st invalid request from one source IP receives 429. IP limiter namespaces are separate from unrelated application routes; the per-key limit still applies across IPs.

`backend/tests/integration/location-api-local-smoke.php` is explicitly restricted to the named local database and needs `ALLOW_LOCAL_LOCATION_SMOKE=1`. It uses the real HTTP kernel and Pahalagama records, creates a temporary key in a transaction, then rolls it back and clears that key's limiter. It never alters GN records. Do not run it against production.

The frontend TypeScript check, production build and tool-registry checks pass in the 3 November 2026 release verification.
