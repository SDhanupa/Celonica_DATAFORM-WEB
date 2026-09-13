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
        console.log("Fetching executions...");
        // Get the execution IDs for the SMS Authenticators
        let flows = await fetchApi('/authentication/flows/Role%20Based%20Login%20Flow/executions');
        
        let adminSmsExec = "0141fc0c-3b8f-4bd4-a608-d0bc35bafe7e"; // hardcoded from earlier
        let userSmsExec = "783843d3-230c-4ab2-b4e2-feb67df4689a"; // hardcoded from earlier

        // To update an existing config, we need to know its ID. 
        // We can just query the execution to get the authenticatorConfig ID
        let adminExecInfo = flows.data.find(e => e.id === adminSmsExec);
        if (adminExecInfo && adminExecInfo.authenticatorConfig) {
            await fetchApi(`/authentication/config/${adminExecInfo.authenticatorConfig}`, 'PUT', {
                alias: "TextWare Config Admin",
                config: { "sms.textware.username": "TW01176_vixva_tr", "sms.textware.password": "Vixva#663", "sms.textware.senderId": "VIXVA" }
            });
        }
        
        let userExecInfo = flows.data.find(e => e.id === userSmsExec);
        if (userExecInfo && userExecInfo.authenticatorConfig) {
            await fetchApi(`/authentication/config/${userExecInfo.authenticatorConfig}`, 'PUT', {
                alias: "TextWare Config User",
                config: { "sms.textware.username": "TW01176_vixva_tr", "sms.textware.password": "Vixva#663", "sms.textware.senderId": "VIXVA" }
            });
        }

        console.log("Successfully fixed SMS API configurations!");
    } catch(err) {
        console.error("Setup failed:", err);
    }
}
run();
