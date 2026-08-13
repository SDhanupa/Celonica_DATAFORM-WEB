const fs = require("fs");
let queries = fs.readFileSync("frontend/src/graphql/queries.ts", "utf8");
let testQueries = fs.readFileSync("frontend/test-apollo-correct.js", "utf8");

const testMatch = testQueries.match(/const GET_GN_BY_CCODE = gql`([\s\S]+?)`;/);
if (!testMatch) {
    console.error("Test match not found!");
    process.exit(1);
}
const replacement = "export const GET_GN_BY_CCODE = gql`" + testMatch[1] + "`;";

const startKey = "export const GET_GN_BY_CCODE = gql`";
const startIndex = queries.indexOf(startKey);

if (startIndex === -1) {
    console.error("Start key not found!");
    process.exit(1);
}

const endKey = "export const SUBMIT_CATEGORY_DATA = gql`";
const endIndex = queries.indexOf(endKey, startIndex);

if (endIndex === -1) {
    console.error("End key not found!");
    process.exit(1);
}

const newQueries = queries.substring(0, startIndex) + replacement + "\n\n" + queries.substring(endIndex);

fs.writeFileSync("frontend/src/graphql/queries.ts", newQueries);
console.log("Successfully replaced safely!");
