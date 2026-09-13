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
        console.log("Fetching User Profile Config...");
        let profile = await fetchApi('/users/profile', 'GET');
        
        let hasMobile = profile.data.attributes.find(a => a.name === 'mobile_number');
        if (!hasMobile) {
            profile.data.attributes.push({
                name: 'mobile_number',
                displayName: 'Mobile Number',
                permissions: { view: ['admin', 'user'], edit: ['admin', 'user'] },
                multivalued: false
            });
            console.log("Updating profile config...");
            await fetchApi('/users/profile', 'PUT', profile.data);
        }
        
        console.log("Setting testuser mobile number...");
        let user = await fetchApi('/users?username=testuser', 'GET');
        let userId = user.data[0].id;
        
        let userData = await fetchApi(`/users/${userId}`, 'GET');
        userData.data.attributes = userData.data.attributes || {};
        userData.data.attributes.mobile_number = ['0712345678'];
        
        await fetchApi(`/users/${userId}`, 'PUT', userData.data);
        console.log("Successfully updated testuser!");
        
    } catch(err) {
        console.error("Failed:", err);
    }
}
run();
