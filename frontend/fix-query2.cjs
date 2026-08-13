const fs = require("fs");
let queries = fs.readFileSync("frontend/src/graphql/queries.ts", "utf8");
let testQueries = fs.readFileSync("frontend/test-apollo-correct.js", "utf8");

// Extract GET_GN_BY_CCODE from test-apollo-correct.js
const testMatch = testQueries.match(/const GET_GN_BY_CCODE = gql`([\s\S]+?)`;/);
const replacement = "export const GET_GN_BY_CCODE = gql`" + testMatch[1] + "`;";

const startKey = "export const GET_GN_BY_CCODE = gql`";
const endKey = "export const GET_P_DISTRICT_WITH_GNS = gql`";

const startIndex = queries.indexOf(startKey);
const endIndex = queries.indexOf(endKey);

if (startIndex > -1 && endIndex > -1) {
    queries = queries.substring(0, startIndex) + replacement + "\n\n  " + queries.substring(endIndex);
    fs.writeFileSync("frontend/src/graphql/queries.ts", queries);
    console.log("Successfully replaced exactly once.");
} else {
    console.log("Could not find start or end index.");
}
