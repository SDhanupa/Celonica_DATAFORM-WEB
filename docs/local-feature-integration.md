# Local feature integration — 2026-10-25

Branch: `codex/local-feature-integration-20261025`, based on `main` at `60257f0`.
This work is local only. Do not push or deploy without a new user instruction.

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
docker exec -e CEYLONICA_APP_ROOT=/var/www celonicaquecionweb-backend-1 php /tmp/feature-branches.php
```

It checks migration preservation, count ownership/validation/persistence,
unchanged scoring, and acceptance of steps 14/15 while rejecting unreachable steps.

Open `http://localhost:5174/gnpage/Ottappuwa/RAYOT` for the integrated dashboard.
Use `./start.ps1` to start local services if needed; it does not run seeders or migrations.
The pre-existing working edits are also saved in a Git stash and
`.local/integration-20261025/local-edits.patch` before restoration.
