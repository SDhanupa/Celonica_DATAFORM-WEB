# Ceylonica Admin Panel — Quick Start Guide

## Prerequisites
- Docker Desktop (running)
- XAMPP with PHP 8.2+ (running Apache)
- Node.js v20+
- Composer

---

## Step 1: Start Docker Services (PostgreSQL + Keycloak)

```powershell
cd "c:\xampp\htdocs\Celonica Quecion web"
docker compose up -d
```

Wait ~60 seconds for Keycloak to start. Check: http://localhost:8080

---

## Step 2: Run Database Migrations

```powershell
cd "c:\xampp\htdocs\Celonica Quecion web\backend"
php artisan migrate
php artisan db:seed
```

---

## Step 3: Get Keycloak Super Admin's User ID

1. Open: http://localhost:8080/admin (login: admin / admin123)
2. Select realm: **celonica-admin**
3. Go to **Users** → click **superadmin**
4. Copy the **ID** field (UUID format)
5. Update `backend/.env`:
   ```
   SUPER_ADMIN_KEYCLOAK_SUB=<paste-uuid-here>
   ```
6. Re-run seeder:
   ```powershell
   php artisan db:seed --class=AdminSeeder
   ```

---

## Step 4: Start Laravel Backend

```powershell
cd "c:\xampp\htdocs\Celonica Quecion web\backend"
php artisan serve --port=8000
```

---

## Step 5: Start React Frontend

```powershell
cd "c:\xampp\htdocs\Celonica Quecion web\frontend"
npm run dev
```

Open: http://localhost:5173

---

## Credentials

| Service | URL | Login |
|---|---|---|
| React Admin Panel | http://localhost:5173 | superadmin / Admin@1234 |
| Keycloak Admin | http://localhost:8080/admin | admin / admin123 |
| PostgreSQL | localhost:5432 | celonica_user / celonica_pass |
| GraphQL Playground | http://localhost:8000/graphql | (needs Bearer token) |

---

## Architecture Summary

```
React (5173) → Keycloak Login → Token → Laravel GraphQL (8000) → PostgreSQL (5432)
                ↓
           Keycloak (8080)
```
