# Ceylonica Quecion Web - Environment & Docker Recovery Guide

This file serves as a reference manual for environment variables and Docker configuration. If your Docker containers freeze or your environment breaks, follow the instructions in the "Troubleshooting & Recovery" section.

## 1. Environment Variables

### Backend (`backend/.env`)
These are the critical variables required for the Laravel backend to communicate with the database and Keycloak.
```env
APP_NAME="Ceylonica Admin"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration (Local Postgres)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=form_builder_prod
DB_USERNAME=postgres
DB_PASSWORD=dhanu231

# Keycloak Configuration
KEYCLOAK_BASE_URL=http://localhost:8081
KEYCLOAK_REALM=ceylonica-admin
KEYCLOAK_CLIENT_ID=ceylonica-frontend
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_CLIENT_SECRET=my-super-secret-keycloak-client-secret

FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
These variables must be correct for the React frontend to authenticate via Keycloak.
```env
VITE_KEYCLOAK_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=ceylonica-admin
VITE_KEYCLOAK_CLIENT_ID=ceylonica-frontend
VITE_GRAPHQL_URL=/graphql
```

## 2. Docker Containers

Your local environment heavily relies on Docker Desktop to host Keycloak. The compose file is located in the root directory: `docker-compose.yml`.

### Key Services
- **celonica-web-keycloak**: The Keycloak authentication server (maps port `8081` on your machine to port `8080` internally).
- **celonica-web-keycloakdb**: The PostgreSQL database specifically used by Keycloak.

---

## 3. Troubleshooting & Recovery Commands

If your login screen stops working, hangs, or you get `504 Outdated Optimize Dep` / connection refused errors, the Docker Desktop backend has likely frozen. 

Follow these steps to forcefully reset it:

### Step 1: Force Kill Zombie Docker Processes
If Docker Desktop refuses to quit gracefully, open a **PowerShell** window as Administrator and run:
```powershell
taskkill /F /IM com.docker.backend.exe /IM docker-sandbox.exe /IM com.docker.build.exe /IM "Docker Desktop.exe"
```

### Step 2: Restart Docker Desktop
Open Docker Desktop from your Start Menu and wait for the engine to initialize.

### Step 3: Nuke and Rebuild Containers (If they are still broken)
Open PowerShell, navigate to the `Celonica Quecion web` root folder, and run:
```powershell
cd "c:\xampp\htdocs\Celonica Quecion web"

# Stop and remove all corrupted containers
docker-compose -p celonica-web down

# Start Keycloak fresh
docker-compose -p celonica-web up -d keycloak
```

### Step 4: Verify Keycloak is Running
Wait 1-2 minutes for Keycloak to boot, then test if it is responding by running this command in PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/realms/ceylonica-admin/.well-known/openid-configuration"
```
If it returns data (including `authorization_endpoint`), your authentication server is back online. Refresh your React app (`http://localhost:5173`) and everything should work.
