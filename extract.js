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
fs.writeFileSync('extracted_query.txt', query);
