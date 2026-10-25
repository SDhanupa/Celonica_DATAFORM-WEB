# Local feature integration — 2026-10-25

Branch: `codex/local-feature-integration-20261025`, based on `main` at `60257f0`.
The initial integration was local only. On 2026-10-25 the user authorized
publishing the reviewed changes to `Dev`/`main` and hosting, with no production
database or other-project changes.

Production compatibility: rapid-fire count entry is enabled only when the
existing database has its nullable `quantity` column. Hosting currently lacks
that column, so the regular rapid-fire flow remains available and the optional
count offer is hidden. No production migration or seeder is part of deployment.
Local databases with the column retain the count survey.

Merged branches:

- `frontend-ui-updates` at `03d3c29`: location modal and expanded survey steps.
- `feature/contribute-ui-redesign` at `821dbb8`: rapid-fire count survey and multilingual text recovery.
- `ui-ux-redesign` at `74a33e4`: village dashboard, 3D map, and deferred font loading.
- Lowercase remote `dev`, remote `feature/industry-survey-questions-builder`, and
  `shabri-frontend` were already ancestors of the starting code.

The industry-survey branch's local-only commit `de9827e` is preserved on its
original branch; it was not part of the remote changes being integrated.

Conflict resolution retains the current survey editor, shared step titles,
fast GN search, Google signup/profile synchronization, login/SMS behavior, and
safe local startup. The incoming four-second authentication timeout was omitted
because it could redirect a protected page before authentication completes.

Integration fixes:

- Align Material UI System with Material UI 5, and pin the map JSON parser to a
  release compatible with the existing Node 20 environment.
- Make survey step titles and backend validation agree on steps 0–15.
- Prevent MapLibre CSS from collapsing its map container and support tooltips
  while map controls are loading.
- Avoid invalid select values while GN dropdown options are loading.
- Preserve valid Greek, Sinhala, and Tamil text when repairing malformed text.
- Make skipping the last count-survey question omit its previous value.

## Local data

Only `2026_10_11_000001_add_quantity_to_village_topic_answers.php` was applied to
the local Ceylonica database. It adds a nullable quantity column. A full local
database backup and before/after row fingerprints are under the ignored folder
`.local/integration-20261025/`. Existing user, question, survey, and answer values
were verified unchanged.

`BusinessSurveyDocx15SectionsSeeder` is included but was **not run**: it uses
`updateOrCreate` and can rewrite existing question text, ordering and step assignments.
The new step slots are available in the current editor; their question content
depends on the database. No realm imports, user edits, or production operations
were performed.

## Checks

From `frontend/`:

```powershell
node scripts/check-feature-integration.mjs
npm run build
```

The standalone backend check always uses in-memory SQLite, even in a local
container configured for PostgreSQL. From the repository root:

```powershell
docker cp backend/tests/integration/feature-branches.php celonicaquecionweb-backend-1:/tmp/feature-branches.php
docker exec --user www-data -e CEYLONICA_APP_ROOT=/var/www celonicaquecionweb-backend-1 php /tmp/feature-branches.php
```

It checks migration preservation, count ownership/validation/persistence,
unchanged scoring, and acceptance of steps 14/15 while rejecting unreachable steps.

Open `http://localhost:5174/gnpage/Ottappuwa/RAYOT` for the integrated dashboard.
Use `./start.ps1` to start local services if needed; it does not run seeders or migrations.
The pre-existing working edits are also saved in a Git stash and
`.local/integration-20261025/local-edits.patch` before restoration.

## Local logging and location requests

PHP-FPM runs as `www-data`. Run PHP diagnostic scripts in the containers with
`docker exec --user www-data` so they do not create root-owned runtime files.
A root-owned `storage/logs/laravel.log` previously caused signed-in GraphQL
requests to fail with HTTP 500 when the authentication guard wrote its log;
guest requests skipped that log and appeared healthy.

The local entrypoint repairs ownership of this project's log directory/files
and defaults container logging to stderr (visible through `docker logs`). It
respects an explicit `LOG_CHANNEL` override. The hosted entrypoint is unchanged.
