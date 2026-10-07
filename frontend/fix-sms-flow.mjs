import fs from 'fs';

const KEYCLOAK_URL = 'http://localhost:8081'; // Host machine port!
const REALM = 'celonica-admin';
const ADMIN = 'admin';
const PASSWORD = 'admin123';

async function main() {
    console.log("Getting admin token...");
    const tokenRes = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `client_id=admin-cli&username=${ADMIN}&password=${PASSWORD}&grant_type=password`
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // Get executions for browser-with-sms
    const execsRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser-with-sms/executions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    let execs = await execsRes.json();
    
    // Find sms-otp-authenticator at level 0 (the incorrect one)
    const badSmsExec = execs.find(e => e.providerId === 'sms-otp-authenticator' && e.level === 0);
    if (badSmsExec) {
        console.log("Deleting incorrect sms-otp-authenticator execution at level 0...");
        await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/executions/${badSmsExec.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    // Now find the 'forms' subflow alias (flowId)
    const formsFlow = execs.find(e => e.authenticationFlow && e.displayName.toLowerCase().includes('forms'));
    if (!formsFlow) throw new Error("Could not find forms subflow");

    // Add sms-otp-authenticator to the forms subflow!
    console.log("Adding sms-otp-authenticator to the forms subflow: " + formsFlow.displayName);
    const addExecRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/${formsFlow.displayName}/executions/execution`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'sms-otp-authenticator' })
    });
    console.log("Add response:", addExecRes.status, await addExecRes.text());

    // Fetch executions again to find the newly added one
    const execsRes2 = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser-with-sms/executions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    execs = await execsRes2.json();
    
    const newSmsExec = execs.find(e => e.providerId === 'sms-otp-authenticator' && e.level === 1);
    if (newSmsExec) {
        console.log("Setting requirement to REQUIRED...");
        newSmsExec.requirement = 'REQUIRED';
        await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser-with-sms/executions`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(newSmsExec)
        });

        console.log("Creating dummy configuration for the new execution...");
        await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/executions/${newSmsExec.id}/config`, {
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                alias: 'sms-config', 
                config: {
                    'sms.textware.username': 'replace_me', 
                    'sms.textware.password': 'replace_me', 
                    'sms.textware.senderId': 'VIXVA'
                }
            })
        });
    }

    console.log("Done fixing flow!");
}

main().catch(e => console.error(e));
