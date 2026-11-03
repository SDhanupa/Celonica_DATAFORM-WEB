param([switch]$Rebuild)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot
if (!(Test-Path '.local/security.env')) { throw 'Run the local HTTPS setup before starting this configuration.' }
if ($Rebuild) {
    Push-Location (Join-Path $projectRoot 'frontend')
    try {
        & npx vite build --mode secure-local --outDir ../.local/secure-frontend
        if ($LASTEXITCODE -ne 0) { throw 'Secure frontend build failed.' }
    } finally { Pop-Location }
}
if (!(Test-Path '.local/secure-frontend/index.html')) { throw 'Build the secure-local frontend before starting.' }
$normalizedRoot = $projectRoot.Replace('\', '/')
$viteProcesses = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Where-Object {
    $_.CommandLine -and $_.CommandLine.Replace('\', '/') -like "*$normalizedRoot/frontend/node_modules/vite/*"
}
foreach ($viteProcess in $viteProcesses) { Stop-Process -Id $viteProcess.ProcessId -ErrorAction Stop }
$compose = @('compose', '-p', 'celonicaquecionweb', '--env-file', '.env', '--env-file', '.local/security.env', '-f', 'docker-compose.yml', '-f', 'docker-compose.local.yml', '-f', 'docker-compose.secure-local.yml')
& python scripts/local-identity-security.py backup
if ($LASTEXITCODE -ne 0) { throw 'Local identity backup failed. No upgrade was started.' }
$upArgs = @('up', '-d')
if ($Rebuild) { $upArgs += '--build' }
& docker @compose @upArgs db keycloak-db redis keycloak backend frontend secure-gateway
if ($LASTEXITCODE -ne 0) { throw 'Secure local services failed to start. Existing data volumes were preserved.' }
& python scripts/local-identity-security.py audience
if ($LASTEXITCODE -ne 0) { throw 'Local token audience setup failed. Inspect local identity credentials; do not reset the database.' }
& docker @compose exec -T frontend nginx -s reload
if ($LASTEXITCODE -ne 0) { throw 'The local API gateway could not reload.' }
Write-Host 'Website: https://localhost:8443'
Write-Host 'Login:   https://localhost:8444'
Write-Host 'GN demo: https://localhost:8445 (start the separate GN Finder app too)'
Write-Host 'Only loopback ports are published. No migration, seed or production command was run.'
