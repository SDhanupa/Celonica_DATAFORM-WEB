const fs = require("fs");
let queries = fs.readFileSync("frontend/src/graphql/queries.ts", "utf8");
let testQueries = fs.readFileSync("frontend/test-apollo-correct.js", "utf8");

// Extract GET_GN_BY_CCODE from test-apollo-correct.js
const testMatch = testQueries.match(/const GET_GN_BY_CCODE = gql`([\s\S]+?)`;/);
if (!testMatch) throw new Error("Could not find query in test file");

const replacement = "export const GET_GN_BY_CCODE = gql`" + testMatch[1] + "`;";

// Find GET_GN_BY_CCODE in queries.ts
const targetMatch = queries.match(/export const GET_GN_BY_CCODE = gql`[\s\S]+?pProvince \{[\s\S]+?\}[\s\S]+?\}[\s\S]+?\}[\s\S]*?`;/);
if (!targetMatch) {
    console.log("Target regex failed to match. Replacing by substring.");
    const startIndex = queries.indexOf("export const GET_GN_BY_CCODE = gql`");
    const endIndex = queries.indexOf("export const GET_P_DISTRICT_WITH_GNS = gql`");
    if (startIndex !== -1 && endIndex !== -1) {
        queries = queries.substring(0, startIndex) + replacement + "\n\n  " + queries.substring(endIndex);
    } else {
        throw new Error("Could not find start/end indexes");
    }
} else {
    queries = queries.replace(targetMatch[0], replacement);
}

fs.writeFileSync("frontend/src/graphql/queries.ts", queries);
console.log("Query replaced successfully using index method.");
