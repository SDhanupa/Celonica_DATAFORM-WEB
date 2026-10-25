# Ceylonica local development

The local source includes the hosted login/signup UI, privacy and terms pages,
rapid-fire fix, signup profile reuse, optional profile details, and dashboard
account-sync fallback. Local development uses its own Keycloak realm and database.

## Start on this computer

Start Docker Desktop, then run:

```powershell
cd "C:\xampp\htdocs\Celonica Quecion web"
.\start.ps1
```

Open **http://localhost:5174/gnpage**. The script starts only this project's
Compose services and reuses an existing Ceylonica Vite process on port 5174.
It does not run migrations, seeders, realm imports, or deployments.

| Service | Local address |
| --- | --- |
| React development app | http://localhost:5174 |
| API gateway | http://localhost:3001/graphql |
| Keycloak admin | http://localhost:8081/admin/ |
| App PostgreSQL | localhost:5434 / celonica_db |
| Keycloak realm / frontend client | celonica-admin / celonica-frontend |

Port 3001 is the API gateway for Vite; use 5174 for the current development UI.
The other PostgreSQL service on port 5432 belongs to a different project.
Apache and the optional PHP server on port 8000 are not needed for this workflow.

## Edit and verify

- Frontend edits reload through Vite.
- Backend app/config/routes/GraphQL source is mounted into the existing Docker
  service; PHP checks file timestamps on each request.
- Keycloak theme source is mounted with its development caches disabled.
- `backend/.env` is for optional host PHP commands. It points to port 5434.
  Docker gets its settings from Compose, not that file.
- `frontend/.env.local` sets localhost auth and proxies API requests to port 3001.
  Production builds use the tracked `.env.production` settings.
- Machine-specific env files, OAuth secrets, logs and setup backups are ignored
  by Git under `.local/` or their existing env ignore rules.

After changing dependencies or Docker image contents, run `./start.ps1 -Rebuild`.
Java provider source changes require rebuilding its JAR and restarting only this
project's Keycloak. Do not overwrite the provider with stale `target/` artifacts.

Frontend dependency install (only if node_modules is missing):

```powershell
cd frontend
npm ci
```

Backend regression tests use an in-memory SQLite database:

```powershell
cd backend
C:\xampp\php\php.exe vendor/phpunit/phpunit/phpunit --filter "SignupProfileSyncTest|PublicDirectoryPrivacyTest|UserIdGenerationTest"
```

Do not run `migrate:fresh`, blanket seeders, or `docker compose down -v` against
this existing setup. Review any future schema migration separately.

## Local Google login

Google Cloud project: **Ceylonica Sign In**. Local OAuth client:
**Ceylonica Local Keycloak** (separate from the hosted client).

The only local callback is:
`http://localhost:8081/realms/celonica-admin/broker/google/endpoint`.

Keycloak requests `openid email profile`. First Google signup requires NIC and
mobile information; date of birth, gender and address are optional in My Profile.
The local post-login flow retains password plus SMS for admin/super_admin roles.
Google account linking retains Keycloak's existing confirmation and verification.
Google profile collection alone does not verify NIC ownership or mobile ownership.

Credentials are stored privately in `.local/google-oauth.json` and the local
Keycloak database. Never commit/export that file or copy the hosted client secret.
To reapply this local-only configuration with Python 3:

```powershell
python scripts/setup-local-google.py
```

This script requires the existing `local-role-login` flow and localhost callback;
it backs up settings, preserves user records and does not contact hosted Keycloak.
Ordinary startup does not reconfigure Google or modify realm settings.

## Registration and login SMS notifications

The local realm enables `ceylonica-login-sms` for `celonica-frontend` only.
Successful normal/Google registration sends a welcome message with the username;
each fresh successful password, SMS or Google login sends a login notification.
The signup's automatic first login produces one welcome message, not two.
Failed attempts, token refreshes, silent SSO checks and unrelated clients do not
send notifications. Existing OTP verification stays separate.

Notifications use the configured TextWare credentials in Keycloak. They are
queued only after the authentication transaction commits and run off the login
request thread. They are best effort: the bounded in-memory queue is not a
persistent delivery outbox; gateway failures, queue saturation or a server crash
can leave a notification unsent. Failures are logged and never block sign-in.
Accounts without a valid mobile number cannot receive SMS.

Build/test the provider, copy its JAR into `keycloak/providers/`, restart only
`celonica-web-keycloak`, then enable the local listener:

```powershell
cd keycloak-sms-spi
.\apache-maven-3.9.6\bin\mvn.cmd package
cd ..
Copy-Item keycloak-sms-spi/target/keycloak-sms-spi.jar keycloak/providers/keycloak-sms-spi.jar
docker restart celonica-web-keycloak
# Wait for http://localhost:8081 to be ready.
python scripts/setup-local-sms-notifications.py
```

Disable just these notifications with
`python scripts/setup-local-sms-notifications.py --disable`.
This does not disable SMS verification. Realm/event-setting backups are kept in
`.local/`. Production activation requires its own reviewed realm/client settings;
the local setup script is deliberately restricted to localhost.

## Git and hosting

The remote development branch is **Dev**, with a capital D. Use explicit names:

```powershell
git status --short
git fetch origin
git log --oneline --left-right HEAD...origin/Dev
```

Review and commit only intended source changes; keep unrelated edits intact.
After reviewing the target commits, push explicitly to `Dev` and merge to `main`
as part of the release process. Do not create another lowercase `dev` branch on
Windows, where case-only branch names can collide.

Local settings live in **docker-compose.local.yml**, loaded explicitly by
`start.ps1`. Hosting must continue using its existing production Compose/env
configuration without this override. Starting or editing locally does not deploy
anything or change hosted users, production databases, or other projects.
