# Graph Report - .  (2026-07-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 931 nodes · 1104 edges · 200 communities (183 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ce26d1a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- User
- composer.json
- Illuminate\Database\Seeder
- Category
- dependencies
- PGn
- scripts
- queries.ts
- compilerOptions
- compilerOptions
- devDependencies
- frontend/package.json
- mutations.ts
- GramaNiladhari
- Admin
- Question
- UserDashboard.tsx
- SubCategoryPage.tsx
- Illuminate\Database\Eloquent\Factories\HasFactory
- Illuminate\Console\Command
- GramaNiladhari.php
- Illuminate\Database\Eloquent\Model
- ImportTrsAreas.php
- Custom3DBarChart.tsx
- PostOffice
- AppServiceProvider
- TestCase
- HouseholdHeadRelationship.php
- HousingOwnershipStatus.php
- ReligiousAffiliation.php
- PopulationInfographic.tsx
- SurveyPage.tsx
- GnByCoordinates
- HousingWallType.php
- RoomsInHousingUnit.php
- ToiletFacility.php
- ExampleTest
- extract.js
- test_query.js
- test_query_local.js
- tsconfig.json
- setup_keycloak.sh
- test_kc.js
- FixPGnMapping
- restore_db.sh

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 27 edges
2. `GramaNiladhari` - 26 edges
3. `Category` - 22 edges
4. `Admin` - 16 edges
5. `compilerOptions` - 16 edges
6. `compilerOptions` - 15 edges
7. `User` - 14 edges
8. `PGn` - 12 edges
9. `Question` - 10 edges
10. `PDistrict` - 9 edges

## Surprising Connections (you probably didn't know these)
- `GramaNiladharisPage()` --references--> `react`  [EXTRACTED]
  frontend/src/pages/GramaNiladharisPage.tsx → frontend/package.json
- `SubCategoryPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/components/SubCategoryPage.tsx → frontend/src/auth/AuthProvider.tsx
- `CategoriesPage()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/pages/CategoriesPage.tsx → frontend/src/auth/AuthProvider.tsx
- `UserDashboard()` --references--> `react`  [EXTRACTED]
  frontend/src/pages/UserDashboard.tsx → frontend/package.json
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/auth/ProtectedRoute.tsx → frontend/src/auth/AuthProvider.tsx

## Import Cycles
- None detected.

## Communities (200 total, 17 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (40): react, apolloClient, authLink, httpLink, AuthContext, AuthContextType, AuthProvider(), AuthProviderProps (+32 more)

### Community 1 - "User"
Cohesion: 0.06
Nodes (15): OnboardingMutations, UserMutations, UserQueries, Controller, ImageUploadController, KeycloakAuthGuard, User, KeycloakAdminService (+7 more)

### Community 2 - "composer.json"
Cohesion: 0.05
Nodes (42): pestphp/pest-plugin, php-http/discovery, autoload, autoload-dev, psr-4, psr-4, config, allow-plugins (+34 more)

### Community 3 - "Illuminate\Database\Seeder"
Cohesion: 0.06
Nodes (14): Police, PSrilanka, AdminSeeder, CategorySeeder, DatabaseSeeder, GnDivisionHousingSeeder, GnEconomySeeder, GramaNiladhariSeeder (+6 more)

### Community 4 - "Category"
Cohesion: 0.11
Nodes (10): SeedLeafQuestions, CategoryMutations, PoliceMutations, PostOfficeMutations, CategoryQueries, DistrictQueries, QuestionQueries, Category (+2 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (31): @apollo/client, @emotion/react, @emotion/styled, dependencies, @apollo/client, @emotion/react, @emotion/styled, graphql (+23 more)

### Community 6 - "PGn"
Cohesion: 0.09
Nodes (7): HousingDataQuery, GnDivisionHousing, PDistrict, PGn, PProvince, PDistrictSeeder, PProvinceSeeder

### Community 7 - "scripts"
Cohesion: 0.08
Nodes (26): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+18 more)

### Community 8 - "queries.ts"
Cohesion: 0.12
Nodes (12): UPDATE_POLICE_MAPPING, GET_ADMIN, GET_DASHBOARD_STATS, GET_DISTRICTS, GET_GRAMA_NILADHARIS, GET_P_DISTRICT_WITH_GNS, GET_P_DISTRICTS, GET_PHI_AREAS_BY_DISTRICT (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+12 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+12 more)

### Community 11 - "devDependencies"
Cohesion: 0.10
Nodes (19): axios, devDependencies, axios, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite (+11 more)

### Community 12 - "frontend/package.json"
Cohesion: 0.10
Nodes (19): devDependencies, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react, vite, name (+11 more)

### Community 13 - "mutations.ts"
Cohesion: 0.15
Nodes (14): CategoryDialogProps, ACTIVATE_ADMIN, CREATE_CATEGORY, DEACTIVATE_ADMIN, DELETE_CATEGORY, REGISTER_ADMIN, UPDATE_ADMIN_ROLE, UPDATE_CATEGORY (+6 more)

### Community 15 - "Admin"
Cohesion: 0.19
Nodes (4): AdminMutations, AdminQueries, Admin, self

### Community 16 - "Question"
Cohesion: 0.20
Nodes (3): QuestionMutations, Question, UserAnswer

### Community 17 - "UserDashboard.tsx"
Cohesion: 0.14
Nodes (10): Age3DBarChartProps, categoryLabels, palette, categoryLabels, HousingOwnershipChartProps, palette, GET_GN_BY_COORDINATES, getThemeColors() (+2 more)

### Community 18 - "SubCategoryPage.tsx"
Cohesion: 0.17
Nodes (8): QuestionDialogProps, SubCategoryPage(), SubCategoryPageProps, CREATE_QUESTION, DELETE_QUESTION, UPDATE_QUESTION, GET_CATEGORY_ANSWERS, GET_CATEGORY_BY_SLUG

### Community 19 - "Illuminate\Database\Eloquent\Factories\HasFactory"
Cohesion: 0.19
Nodes (5): PhiAreaQueries, DrinkingWaterSource, PhiArea, SolidWasteDisposal, Illuminate\Database\Eloquent\Factories\HasFactory

### Community 20 - "Illuminate\Console\Command"
Cohesion: 0.17
Nodes (6): ImportGramaNiladharis, ImportPhiAreas, ImportPostOffices, MapPGnsToGramaNiladharis, UpdateGramaNiladharis, Illuminate\Console\Command

### Community 22 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.27
Nodes (4): GnEconomy, HousingRoofType, HousingUnitType, Illuminate\Database\Eloquent\Model

### Community 23 - "ImportTrsAreas.php"
Cohesion: 0.32
Nodes (3): ImportTrsAreas, TrsAreaQueries, TrsArea

### Community 24 - "Custom3DBarChart.tsx"
Cohesion: 0.29
Nodes (5): Custom3DBarChartProps, desktopCategoryLabels, mobileCategoryLabels, palette, GET_HOUSING_DATA

### Community 27 - "TestCase"
Cohesion: 0.40
Nodes (3): ExampleTest, TestCase, Illuminate\Foundation\Testing\TestCase

### Community 31 - "PopulationInfographic.tsx"
Cohesion: 0.40
Nodes (3): data, PopulationInfographicProps, translations

### Community 32 - "SurveyPage.tsx"
Cohesion: 0.40
Nodes (3): ANSWER_QUESTION, GET_MY_ANSWERS, GET_QUESTIONS

### Community 38 - "extract.js"
Cohesion: 0.50
Nodes (3): content, fs, lines

### Community 39 - "test_query.js"
Cohesion: 0.50
Nodes (3): content, fs, lines

### Community 40 - "test_query_local.js"
Cohesion: 0.50
Nodes (3): content, fs, lines

## Knowledge Gaps
- **174 isolated node(s):** `$schema`, `name`, `type`, `description`, `laravel` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `App.tsx`, `frontend/package.json`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `react` connect `App.tsx` to `queries.ts`, `UserDashboard.tsx`, `dependencies`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `Illuminate\Database\Eloquent\Factories\HasFactory`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `GramaNiladhari` (e.g. with `.handle()` and `.handle()`) actually correct?**
  _`GramaNiladhari` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _174 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05819209039548023 - nodes in this community are weakly interconnected._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.06086956521739131 - nodes in this community are weakly interconnected._