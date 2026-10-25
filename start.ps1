#!/usr/bin/env pwsh
[CmdletBinding()]
param([switch]$Rebuild)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$composeProject = 'celonicaquecionweb'
$composeArgs = @('compose', '-p', $composeProject, '-f', (Join-Path $projectRoot 'docker-compose.yml'), '-f', (Join-Path $projectRoot 'docker-compose.local.yml'))
$logDirectory = Join-Path $projectRoot '.local'
New-Item -ItemType Directory -Force $logDirectory | Out-Null
Get-Command docker, node, npm -ErrorAction Stop | Out-Null
& docker info --format '{{.ServerVersion}}' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Start Docker Desktop, then run this script again.' }
if (-not (Test-Path (Join-Path $projectRoot 'frontend/node_modules/vite/bin/vite.js'))) {
    throw 'Frontend dependencies are missing. Run npm ci in the frontend directory first.'
}
Write-Host 'Starting local Ceylonica services; existing data volumes are preserved...' -ForegroundColor Cyan
$upArgs = @('up', '-d')
if ($Rebuild) { $upArgs += '--build' }
& docker @composeArgs @upArgs db keycloak-db redis keycloak backend frontend
if ($LASTEXITCODE -ne 0) { throw 'Docker services could not start. No migrations or seeds were run.' }
& docker @composeArgs exec -T frontend nginx -s reload
if ($LASTEXITCODE -ne 0) { throw 'The local API gateway could not reload.' }
$ready = $false
for ($attempt = 0; $attempt -lt 45; $attempt++) {
    try {
        $null = Invoke-RestMethod 'http://localhost:8081/realms/celonica-admin/.well-known/openid-configuration' -TimeoutSec 3
        $null = Invoke-RestMethod 'http://localhost:3001/api/guest-token' -TimeoutSec 3
        $ready = $true
        break
    } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) { throw 'Local authentication/API is not ready. Inspect Docker logs; data has not been reset.' }
$listener = Get-NetTCPConnection -State Listen -LocalPort 5174 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
    if ($owner.CommandLine -notlike "*$projectRoot*frontend*node_modules*vite*") {
        throw 'Port 5174 is used by another process. It was left running; free that port before continuing.'
    }
    Write-Host 'The Ceylonica frontend is already running on port 5174.'
} else {
    $vite = Join-Path $projectRoot 'frontend/node_modules/vite/bin/vite.js'
    Start-Process -FilePath (Get-Command node).Source -ArgumentList @(('"' + $vite + '"'), '--host', '127.0.0.1', '--port', '5174', '--strictPort') -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'vite.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'vite.stderr.log') | Out-Null
}
Write-Host 'Local app:      http://localhost:5174/gnpage' -ForegroundColor Green
Write-Host 'Local API:      http://localhost:3001/graphql'
Write-Host 'Local Keycloak: http://localhost:8081/admin/'
Write-Host 'Source changes reload locally. No migrations, seeders, or production deployments were run.'
