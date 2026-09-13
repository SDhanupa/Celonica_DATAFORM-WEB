const https = require('http');
const TOKEN = process.argv[2];
const BASE_URL = 'http://localhost:8081/admin/realms/ceylonica-admin';

async function fetchApi(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve({status: res.statusCode, data: data ? JSON.parse(data) : null}); }
                    catch (e) { resolve({status: res.statusCode, data: data}); }
                } else {
                    reject(`Error ${res.statusCode} on ${method} ${path}: ${data}`);
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        const flowName = "Role Based Login Flow";
        
        // 1. Create a brand new basic flow
        console.log(`Creating new flow: ${flowName}`);
        try {
            await fetchApi(`/authentication/flows`, 'POST', {
                alias: flowName,
                description: "Dynamic flow based on Admin vs User",
                providerId: "basic-flow",
                topLevel: true,
                builtIn: false
            });
        } catch(e) {
            console.log("Flow might already exist, ignoring...");
        }

        // 2. Add Username Form (Level 0)
        console.log("Adding Username Form...");
        await fetchApi(`/authentication/flows/${flowName}/executions/execution`, 'POST', {provider: 'auth-username-form'});
        
        // 3. Add Admin Subflow (Level 0)
        console.log("Adding Admin Subflow...");
        await fetchApi(`/authentication/flows/${flowName}/executions/flow`, 'POST', {
            alias: 'Admin Auth Subflow',
            description: 'Flow for admins',
            provider: 'registration-page-form',
            type: 'basic-flow'
        });

        // 4. Add User Subflow (Level 0)
        console.log("Adding User Subflow...");
        await fetchApi(`/authentication/flows/${flowName}/executions/flow`, 'POST', {
            alias: 'User Auth Subflow',
            description: 'Flow for normal users',
            provider: 'registration-page-form',
            type: 'basic-flow'
        });

        // Set Top-Level Requirements
        let executionsRes = await fetchApi(`/authentication/flows/${flowName}/executions`, 'GET');
        let executions = executionsRes.data;
        for (let exe of executions) {
            if (exe.authenticator === 'auth-username-form') {
                exe.requirement = 'REQUIRED';
                await fetchApi(`/authentication/flows/${flowName}/executions`, 'PUT', exe);
            }
            if (exe.flowAlias === 'Admin Auth Subflow' || exe.flowAlias === 'User Auth Subflow') {
                exe.requirement = 'CONDITIONAL';
                await fetchApi(`/authentication/flows/${flowName}/executions`, 'PUT', exe);
            }
        }

        // 5. Populate Admin Subflow
        console.log("Populating Admin Subflow...");
        await fetchApi(`/authentication/flows/Admin Auth Subflow/executions/execution`, 'POST', {provider: 'conditional-user-role'});
        await fetchApi(`/authentication/flows/Admin Auth Subflow/executions/execution`, 'POST', {provider: 'auth-password-form'});
        await fetchApi(`/authentication/flows/Admin Auth Subflow/executions/execution`, 'POST', {provider: 'sms-otp-authenticator'});
        
        let adminExes = (await fetchApi(`/authentication/flows/Admin Auth Subflow/executions`, 'GET')).data;
        for (let exe of adminExes) {
            exe.requirement = 'REQUIRED';
            await fetchApi(`/authentication/flows/${flowName}/executions`, 'PUT', exe);
            
            // Configure Condition - User Role for Admin
            if (exe.authenticator === 'conditional-user-role') {
                await fetchApi(`/authentication/executions/${exe.id}/config`, 'POST', {
                    alias: "Check if Admin",
                    config: { "condUserRole": "admin", "negate": "false" }
                });
            }
            // Configure SMS for Admin
            if (exe.authenticator === 'sms-otp-authenticator') {
                await fetchApi(`/authentication/executions/${exe.id}/config`, 'POST', {
                    alias: "TextWare Config Admin",
                    config: { "textware.username": "TW01176_vixva_tr", "textware.password": "Vixva#663", "textware.sender_id": "VIXVA" }
                });
            }
        }

        // 6. Populate User Subflow
        console.log("Populating User Subflow...");
        await fetchApi(`/authentication/flows/User Auth Subflow/executions/execution`, 'POST', {provider: 'conditional-user-role'});
        await fetchApi(`/authentication/flows/User Auth Subflow/executions/flow`, 'POST', {
            alias: 'Password or SMS Option',
            description: 'Choose between Password or SMS',
            provider: 'registration-page-form',
            type: 'basic-flow'
        });

        let userExes = (await fetchApi(`/authentication/flows/User Auth Subflow/executions`, 'GET')).data;
        for (let exe of userExes) {
            exe.requirement = 'REQUIRED';
            await fetchApi(`/authentication/flows/${flowName}/executions`, 'PUT', exe);
            
            // Configure Condition - User Role for Not Admin
            if (exe.authenticator === 'conditional-user-role') {
                await fetchApi(`/authentication/executions/${exe.id}/config`, 'POST', {
                    alias: "Check if Not Admin",
                    config: { "condUserRole": "admin", "negate": "true" }
                });
            }
        }

        // 7. Populate Password or SMS Choice Subflow
        console.log("Populating Choice Subflow...");
        await fetchApi(`/authentication/flows/Password or SMS Option/executions/execution`, 'POST', {provider: 'auth-password-form'});
        await fetchApi(`/authentication/flows/Password or SMS Option/executions/execution`, 'POST', {provider: 'sms-otp-authenticator'});
        
        let choiceExes = (await fetchApi(`/authentication/flows/Password or SMS Option/executions`, 'GET')).data;
        for (let exe of choiceExes) {
            exe.requirement = 'ALTERNATIVE';
            await fetchApi(`/authentication/flows/${flowName}/executions`, 'PUT', exe);
            
            // Configure SMS for User
            if (exe.authenticator === 'sms-otp-authenticator') {
                await fetchApi(`/authentication/executions/${exe.id}/config`, 'POST', {
                    alias: "TextWare Config User",
                    config: { "textware.username": "TW01176_vixva_tr", "textware.password": "Vixva#663", "textware.sender_id": "VIXVA" }
                });
            }
        }

        // 8. Bind Flow to Browser
        console.log("Binding Flow...");
        let realm = (await fetchApi('', 'GET')).data;
        realm.browserFlow = flowName;
        await fetchApi('', 'PUT', realm);

        console.log("Successfully built and bound Role Based SMS Flow!");
    } catch(err) {
        console.error("Setup failed:", err);
    }
}
run();
