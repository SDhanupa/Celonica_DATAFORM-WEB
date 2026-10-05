// Script to create a custom registration flow with SMS verification
const http = require('http');
const TOKEN = process.argv[2];
const BASE = 'http://localhost:8081/admin/realms/ceylonica-admin';

async function api(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE + path);
        const opts = {
            hostname: url.hostname, port: url.port,
            path: url.pathname + url.search, method,
            headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
        };
        const req = http.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve({ status: res.statusCode, data: d ? JSON.parse(d) : null, headers: res.headers }); }
                    catch { resolve({ status: res.statusCode, data: d, headers: res.headers }); }
                } else reject(`${res.statusCode} ${method} ${path}: ${d}`);
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        // Step 1: Copy the built-in registration flow
        console.log("Step 1: Copying built-in registration flow...");
        const copy = await api('/authentication/flows/registration/copy', 'POST', { newName: 'Ceylonica Registration Flow' });
        console.log(`  Copy status: ${copy.status}`);

        // Step 2: Get executions of the new flow
        console.log("Step 2: Getting executions of new flow...");
        const execs = await api('/authentication/flows/Ceylonica%20Registration%20Flow/executions', 'GET');
        console.log(`  Executions: ${execs.data.length}`);
        execs.data.forEach(e => console.log(`    - ${e.displayName} [${e.providerId}] id=${e.id} flowId=${e.flowId}`));

        // Step 3: Find the "registration form" sub-flow
        const regForm = execs.data.find(e => e.providerId === 'registration-page-form');
        console.log(`  Registration form subflow: ${regForm ? regForm.displayName : 'NOT FOUND'}, flowId=${regForm?.flowId}`);

        // Step 4: Add sms-registration-action to the registration form subflow
        console.log("Step 3: Adding SMS registration action...");
        const add = await api(`/authentication/flows/${encodeURIComponent(regForm.displayName)}/executions/execution`, 'POST', { provider: 'sms-registration-action' });
        console.log(`  Add status: ${add.status}`);

        // Step 5: Get executions again to find the new one
        console.log("Step 4: Getting updated executions...");
        const execs2 = await api('/authentication/flows/Ceylonica%20Registration%20Flow/executions', 'GET');
        const smsExec = execs2.data.find(e => e.providerId === 'sms-registration-action');
        console.log(`  SMS exec: ${smsExec ? smsExec.id : 'NOT FOUND'}, req=${smsExec?.requirement}`);

        // Step 6: Set it to REQUIRED
        if (smsExec) {
            console.log("Step 5: Setting SMS action to REQUIRED...");
            const upd = await api('/authentication/flows/Ceylonica%20Registration%20Flow/executions', 'PUT', {
                ...smsExec, requirement: 'REQUIRED'
            });
            console.log(`  Update status: ${upd.status}`);
        }

        // Step 7: Bind new flow to realm as the registration flow
        console.log("Step 6: Binding new flow to realm...");
        const bind = await api('', 'PUT', { registrationFlow: 'Ceylonica Registration Flow' });
        console.log(`  Bind status: ${bind.status}`);

        console.log("\nDone! Registration flow with SMS is now active.");
    } catch(err) {
        console.error("Error:", err);
    }
}

run();
