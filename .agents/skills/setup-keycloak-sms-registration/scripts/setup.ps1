$ErrorActionPreference = 'Stop'

Write-Host "Building keycloak-sms-spi.jar..."
Set-Location "keycloak-sms-spi"
& ".\apache-maven-3.9.6\bin\mvn.cmd" -q -o package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Error "Maven build failed."
    exit $LASTEXITCODE
}
Set-Location ".."

Write-Host "Copying jar to keycloak providers..."
Copy-Item "keycloak-sms-spi\target\keycloak-sms-spi.jar" "keycloak\providers\keycloak-sms-spi.jar" -Force

Write-Host "Restarting Keycloak container..."
docker restart celonica-web-keycloak
Start-Sleep -Seconds 30

# Wait for Keycloak to be ready
Write-Host "Waiting for Keycloak to be ready..."
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    $log = docker logs --since 1m celonica-web-keycloak 2>&1 | Select-String -Pattern "started in"
    if ($log) {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 5
}
if (-not $ready) {
    Write-Warning "Keycloak might not be fully started yet, proceeding anyway..."
}

Write-Host "Reading TextWare credentials from backend/.env..."
$envFile = Get-Content "backend\.env"
$twUser = ($envFile | Select-String -Pattern '^TEXTWARE_USERNAME=(.*)' | % { $_.Matches.Groups[1].Value })
$twPass = ($envFile | Select-String -Pattern '^TEXTWARE_PASSWORD=(.*)' | % { $_.Matches.Groups[1].Value })
$twSender = ($envFile | Select-String -Pattern '^TEXTWARE_SENDER_ID=(.*)' | % { $_.Matches.Groups[1].Value })

if (-not $twUser -or -not $twPass) {
    Write-Error "Could not find TextWare credentials in backend/.env"
    exit 1
}

Write-Host "Configuring Keycloak SMS Registration Flow..."

$setupScript = @"
#!/bin/sh
K=/opt/keycloak/bin/kcadm.sh
R=celonica-admin

# Login
`$K config credentials --server http://localhost:8080 --realm master --user admin --password admin123

# Check if flow already exists
FLOW_ID=`$(`$K get authentication/flows -r `$R --fields id,alias --format csv --noquotes | grep 'registration-with-sms$' | cut -d',' -f1)
if [ -n "`$FLOW_ID" ]; then
    echo "Flow registration-with-sms already exists. Deleting it to start fresh..."
    `$K update realms/`$R -s registrationFlow=registration
    `$K delete authentication/flows/`$FLOW_ID -r `$R
fi

echo "Creating registration-with-sms flow..."
`$K create authentication/flows/registration/copy -r `$R -s newName=registration-with-sms
`$K create "authentication/flows/registration-with-sms%20registration%20form/executions/execution" -r `$R -s provider=sms-registration-action

# Get the execution ID for the SMS action
EXEC_ID=`$(`$K get authentication/flows/registration-with-sms/executions -r `$R --fields id,providerId --format csv --noquotes | grep 'sms-registration-action' | cut -d',' -f1 | head -n 1)

if [ -z "`$EXEC_ID" ]; then
    echo "Error: Could not find sms-registration-action in the flow."
    exit 1
fi

cat > /tmp/cfg.json <<'EOF'
{"alias":"sms-registration-config","config":{"sms.textware.username":"${twUser}","sms.textware.password":"${twPass}","sms.textware.senderId":"${twSender}"}}
EOF

# Check if config exists on this execution
CONF_ID=`$(`$K get authentication/executions/`$EXEC_ID -r `$R | grep '"authenticatorConfig"' | sed 's/.*"authenticatorConfig" : "\([^"]*\)".*/\1/')

if [ -n "`$CONF_ID" ]; then
    echo "Updating existing config `$CONF_ID..."
    `$K update authentication/config/`$CONF_ID -r `$R -f /tmp/cfg.json
else
    echo "Creating new config for execution..."
    `$K create authentication/executions/`$EXEC_ID/config -r `$R -f /tmp/cfg.json
fi

# Set the flow as the default registration flow for the realm
`$K update realms/`$R -s registrationFlow=registration-with-sms

rm -f /tmp/cfg.json
echo "Keycloak configuration complete."
"@

Set-Content -Path "$env:TEMP\kc_setup_sms.sh" -Value $setupScript
docker cp "$env:TEMP\kc_setup_sms.sh" celonica-web-keycloak:/tmp/kc_setup_sms.sh
docker exec celonica-web-keycloak sh -c "tr -d '\r' < /tmp/kc_setup_sms.sh > /tmp/clean.sh && sh /tmp/clean.sh"
docker exec -u root celonica-web-keycloak rm -f /tmp/kc_setup_sms.sh /tmp/clean.sh
Remove-Item "$env:TEMP\kc_setup_sms.sh" -ErrorAction SilentlyContinue

Write-Host "Updating execution requirement to REQUIRED via REST API..."
$execIdStr = docker exec celonica-web-keycloak sh -c "/opt/keycloak/bin/kcadm.sh get authentication/flows/registration-with-sms/executions -r celonica-admin --fields id,providerId --format csv --noquotes | grep 'sms-registration-action' | cut -d',' -f1 | head -n 1"
$execId = $execIdStr.Trim()

if ($execId) {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8081/realms/master/protocol/openid-connect/token" -Method Post -Body @{
        client_id = "admin-cli"
        username = "admin"
        password = "admin123"
        grant_type = "password"
    }
    Invoke-RestMethod -Uri "http://localhost:8081/admin/realms/celonica-admin/authentication/flows/registration-with-sms/executions" -Method Put -Headers @{
        Authorization = "Bearer $($tokenResponse.access_token)"
    } -ContentType "application/json" -Body "{`"id`":`"$execId`",`"requirement`":`"REQUIRED`"}"
    Write-Host "Execution updated successfully."
} else {
    Write-Error "Could not retrieve execution ID for SMS action."
}

Write-Host "All done!"
