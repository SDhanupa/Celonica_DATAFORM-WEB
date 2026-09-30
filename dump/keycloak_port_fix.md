# 🔑 Keycloak Port Fix — Local Machine Note

## Problem
After every `git pull`, the frontend `.env` reverts to:
```
VITE_KEYCLOAK_URL=http://localhost:8080
```
This breaks login with `ERR_CONNECTION_REFUSED` because Keycloak runs on **port 8081** on this machine.

## ✅ Permanent Fix Applied

Created `frontend/.env.local` with:
```env
VITE_KEYCLOAK_URL=http://localhost:8081
```

### Why this works forever:
- Vite loads `.env.local` **after** `.env`, so it overrides the port.
- `frontend/.env.local` is listed in `.gitignore` — it will **NEVER be touched by git pull, git checkout, or any branch switch**.
- You only need to create this file **once** on this machine and it's permanent.

## If you set up a new machine / teammate
Tell them to create `frontend/.env.local` with:
```env
VITE_KEYCLOAK_URL=http://localhost:8081
```
(Only needed if their Keycloak also runs on 8081 — production uses 8080 via Docker.)

## Vite env file load order (highest priority last wins)
```
.env              ← committed to git (8080)
.env.local        ← gitignored, NEVER overwritten (8081) ← WINS ✅
.env.development
.env.development.local
```

*Note created: 2026-09-29*
