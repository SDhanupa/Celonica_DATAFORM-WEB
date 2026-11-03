# Local login and map setup — 2 November 2026

Run `./start.ps1` from the project root. The app is at
http://localhost:5174/gnpage, with the API at http://localhost:3001 and
Keycloak at http://localhost:8081.

## Login

The local `celonica-admin` realm uses `local-password-login`: an SSO cookie
alternative and a required username/password subflow. This matches the hosted
username-first layout while retaining existing local accounts and passwords.
Google and SMS are not configured by this setup.

To reproduce the realm configuration after starting the services, run:

```powershell
python scripts/setup-local-password-login.py
```

The script is restricted to localhost, preserves the default browser flow,
backs up the previous binding in `.local/password-login-backup-*`, and refuses
to replace an unrelated custom flow. To undo the binding, select the backed-up
`browserFlow` in the local Keycloak realm's Authentication bindings.

## Map data

The supplied production archive omitted `public.gn_divisions`. The existing
local `celonica_db` contained this table; its 14,051 boundary rows were copied
into `ceylonica_production_20261102` using a single transaction after backing up
the destination. No imported production tables were replaced.

The active database and Keycloak configuration persist in Docker volumes.
Do not remove those volumes when restarting the project. The source database
`celonica_db` remains available. The map's imagery and terrain still require
internet access to their existing public tile providers.

## Verification

- Username → password flow, incorrect-password feedback and successful login.
- Protected admin URL preserves its query string and fragment after login.
- The admin survey screen shows all 57 records (48 submitted, 9 drafts).
- Boundary API checked for Pahalagama (RATPA), Bolgoda (WKBBG), Habarana (RAUHA).
- All original row values in the archive's 40 tables remain present unchanged.
- Frontend production build and TypeScript checks passed.

Statistics can differ from the hosted site because this local instance uses
the supplied database snapshot. Local changes have not been committed or pushed.
