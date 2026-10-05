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
        console.log("Fixing missing configurations...");
        
        await fetchApi('/authentication/executions/94560bf9-7fbc-4715-b270-16ddf4778b75/config', 'POST', {
            alias: "Check if Admin",
            config: { "condUserRole": "admin", "negate": "false" }
        });

        await fetchApi('/authentication/executions/0141fc0c-3b8f-4bd4-a608-d0bc35bafe7e/config', 'POST', {
            alias: "TextWare Config Admin",
            config: { "textware.username": "TW01176_vixva_tr", "textware.password": "Vixva#663", "textware.sender_id": "VIXVA" }
        });

        await fetchApi('/authentication/executions/89b98bb4-f7d4-4d33-a16f-8a83ee7abbfa/config', 'POST', {
            alias: "Check if Not Admin",
            config: { "condUserRole": "admin", "negate": "true" }
        });

        await fetchApi('/authentication/executions/783843d3-230c-4ab2-b4e2-feb67df4689a/config', 'POST', {
            alias: "TextWare Config User",
            config: { "textware.username": "TW01176_vixva_tr", "textware.password": "Vixva#663", "textware.sender_id": "VIXVA" }
        });

        console.log("Successfully bound configurations!");
    } catch(err) {
        console.error("Setup failed:", err);
    }
}
run();
