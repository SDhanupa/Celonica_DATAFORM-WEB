const fs = require('fs');
const content = fs.readFileSync('frontend/src/graphql/queries.ts', 'utf8');
const lines = content.split('\n');
let query = '';
let inQuery = false;
for(let line of lines) {
    if (line.includes('export const GET_P_DISTRICT_WITH_GNS = gql`')) {
        inQuery = true;
        continue;
    }
    if (inQuery && line.includes('`;')) {
        break;
    }
    if (inQuery) query += line + '\n';
}
fetch('http://localhost:8000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query, variables: { id: '2' } })
}).then(async r => {
    console.log('Status:', r.status);
    const text = await r.text();
    fs.writeFileSync('local_res.json', text);
    console.log('Response saved, length:', text.length);
}).catch(console.error);
