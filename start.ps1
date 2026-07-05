#!/usr/bin/env pwsh
# ============================================================
# Celonica Admin Panel — One-click startup script
# ============================================================
# Run this script from the project root:
#   cd "c:\xampp\htdocs\Celonica Quecion web"
#   .\start.ps1
# ============================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Celonica Admin Panel Startup        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot

# 1. Start Docker (PostgreSQL + Keycloak)
Write-Host "▶ Starting Docker services (PostgreSQL + Keycloak)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "docker" -ArgumentList "compose up -d" -WorkingDirectory $ProjectRoot
Start-Sleep -Seconds 5

# 2. Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 20
$attempt = 0
do {
    $attempt++
    Start-Sleep -Seconds 3
    $result = docker exec celonica_postgres pg_isready -U celonica_user 2>&1
    Write-Host "   Attempt $attempt/$maxAttempts: $result"
} while ($result -notlike "*accepting connections*" -and $attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Host "❌ PostgreSQL did not start in time. Check Docker logs." -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green

# 3. Run Laravel migrations
Write-Host ""
Write-Host "▶ Running database migrations..." -ForegroundColor Yellow
$backendPath = Join-Path $ProjectRoot "backend"
$migration = & php artisan migrate --force 2>&1
Write-Host $migration

# 4. Seed database
Write-Host ""
Write-Host "▶ Seeding super admin..." -ForegroundColor Yellow
$seed = & php artisan db:seed --force 2>&1
Write-Host $seed

# 5. Start Laravel in background
Write-Host ""
Write-Host "▶ Starting Laravel API server on :8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; php artisan serve --port=8000" -WorkingDirectory $backendPath

# 6. Start React dev server
Write-Host "▶ Starting React frontend on :5173..." -ForegroundColor Yellow
$frontendPath = Join-Path $ProjectRoot "frontend"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WorkingDirectory $frontendPath

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅  All services started!                               ║" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║  🌐 Admin Panel:  http://localhost:5173                  ║" -ForegroundColor Green
Write-Host "║  🔗 GraphQL API:  http://localhost:8000/graphql          ║" -ForegroundColor Green
Write-Host "║  🔑 Keycloak:     http://localhost:8080/admin            ║" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║  Login: superadmin / Admin@1234                         ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
