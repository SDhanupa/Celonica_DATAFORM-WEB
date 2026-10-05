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
                    try {
                        resolve({status: res.statusCode, data: data ? JSON.parse(data) : null});
                    } catch (e) {
                        resolve({status: res.statusCode, data: data});
                    }
                } else {
                    reject(`Error ${res.statusCode}: ${data}`);
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
        console.log("Copying Browser Flow...");
        await fetchApi('/authentication/flows/browser/copy', 'POST', {newName: "Browser with SMS Fixed"});
        
        console.log("Getting Executions...");
        let executionsRes = await fetchApi('/authentication/flows/Browser with SMS Fixed/executions', 'GET');
        let executions = executionsRes.data;

        console.log("Deleting old forms subflow...");
        for (let exe of executions) {
            if (exe.flowAlias === 'forms') {
                await fetchApi(`/authentication/executions/${exe.id}`, 'DELETE');
            }
        }

        console.log("Adding Username Form...");
        await fetchApi('/authentication/flows/Browser with SMS Fixed/executions/execution', 'POST', {provider: 'auth-username-form'});
        
        console.log("Adding Password or SMS Subflow...");
        await fetchApi('/authentication/flows/Browser with SMS Fixed/executions/flow', 'POST', {
            alias: 'Password or SMS Choice',
            description: 'Choose between Password or SMS',
            provider: 'registration-page-form',
            type: 'basic-flow'
        });

        // Set them to REQUIRED
        executionsRes = await fetchApi('/authentication/flows/Browser with SMS Fixed/executions', 'GET');
        executions = executionsRes.data;
        for (let exe of executions) {
            if (exe.authenticator === 'auth-username-form' || exe.flowAlias === 'Password or SMS Choice') {
                exe.requirement = 'REQUIRED';
                await fetchApi('/authentication/flows/Browser with SMS Fixed/executions', 'PUT', exe);
            }
        }

        console.log("Adding Password Form to Subflow...");
        await fetchApi('/authentication/flows/Password or SMS Choice/executions/execution', 'POST', {provider: 'auth-password-form'});
        
        console.log("Adding SMS OTP to Subflow...");
        await fetchApi('/authentication/flows/Password or SMS Choice/executions/execution', 'POST', {provider: 'sms-otp-authenticator'});

        // Set them to ALTERNATIVE and configure SMS
        executionsRes = await fetchApi('/authentication/flows/Password or SMS Choice/executions', 'GET');
        executions = executionsRes.data;
        let smsExeId = null;
        for (let exe of executions) {
            exe.requirement = 'ALTERNATIVE';
            await fetchApi('/authentication/flows/Browser with SMS Fixed/executions', 'PUT', exe);
            if (exe.authenticator === 'sms-otp-authenticator') {
                smsExeId = exe.id;
            }
        }

        if (smsExeId) {
            console.log("Configuring SMS OTP...");
            await fetchApi(`/authentication/executions/${smsExeId}/config`, 'POST', {
                alias: "TextWare Config",
                config: {
                    "textware.username": "TW01176_vixva_tr",
                    "textware.password": "Vixva#663",
                    "textware.sender_id": "VIXVA"
                }
            });
        }

        console.log("Binding Flow...");
        let realmRes = await fetchApi('', 'GET');
        let realm = realmRes.data;
        realm.browserFlow = "Browser with SMS Fixed";
        await fetchApi('', 'PUT', realm);

        console.log("Done!");
    } catch(err) {
        console.error("Setup failed:", err);
    }
}
run();
