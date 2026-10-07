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
    if (!tokenData.access_token) throw new Error("Failed to authenticate: " + JSON.stringify(tokenData));
    const token = tokenData.access_token;
    console.log("Authenticated successfully.");

    // See if "browser-with-sms" already exists
    const flowsRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const flows = await flowsRes.json();
    
    let smsFlow = flows.find(f => f.alias === 'browser-with-sms');
    if (!smsFlow) {
        console.log("Copying browser flow to 'browser-with-sms'...");
        const copyRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser/copy`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ newName: 'browser-with-sms' })
        });
        if (!copyRes.ok) throw new Error("Failed to copy flow: " + await copyRes.text());
        
        // Wait a bit
        await new Promise(r => setTimeout(r, 1000));
        const newFlowsRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const newFlows = await newFlowsRes.json();
        smsFlow = newFlows.find(f => f.alias === 'browser-with-sms');
    }
    console.log("Flow 'browser-with-sms' exists. ID:", smsFlow.id);

    // Get executions
    const execsRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser-with-sms/executions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    let execs = await execsRes.json();
    
    // Find the forms sub-flow alias (usually ends with 'forms')
    let formsFlow = execs.find(e => e.displayName && e.displayName.toLowerCase().includes('forms'));
    if (!formsFlow) {
         // fallback: just find a subflow
         formsFlow = execs.find(e => e.authenticationFlow);
    }
    if (!formsFlow) throw new Error("Could not find forms subflow in browser-with-sms");
    console.log("Forms sub-flow alias:", formsFlow.flowId);

    // Check if SMS authenticator is already in forms subflow
    let smsExec = execs.find(e => e.providerId === 'sms-otp-authenticator');
    if (!smsExec) {
        console.log("Adding sms-otp-authenticator execution to flow...");
        const addExecRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser-with-sms/executions/execution`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: 'sms-otp-authenticator' })
        });
        
        console.log("Add execution response:", addExecRes.status, await addExecRes.text());
        
        // Fetch executions again
        const execsRes2 = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser-with-sms/executions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        execs = await execsRes2.json();
        smsExec = execs.find(e => e.providerId === 'sms-otp-authenticator');
    }

    if (smsExec && smsExec.requirement !== 'REQUIRED') {
        console.log("Setting sms-otp-authenticator requirement to REQUIRED...");
        smsExec.requirement = 'REQUIRED';
        const updateRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/authentication/flows/browser-with-sms/executions`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(smsExec)
        });
        console.log("Update requirement response:", updateRes.status, await updateRes.text());
    }

    // Set as realm browser flow
    console.log("Setting realm browser flow to 'browser-with-sms'...");
    const realmRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const realmData = await realmRes.json();
    realmData.browserFlow = 'browser-with-sms';
    
    const updateRealmRes = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(realmData)
    });
    console.log("Update realm response:", updateRealmRes.status);
    console.log("Done!");
}

main().catch(e => console.error(e));
