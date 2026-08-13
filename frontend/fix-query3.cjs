const fs = require("fs");
let queries = fs.readFileSync("frontend/src/graphql/queries.ts", "utf8");
let testQueries = fs.readFileSync("frontend/test-apollo-correct.js", "utf8");

const testMatch = testQueries.match(/const GET_GN_BY_CCODE = gql`([\s\S]+?)`;/);
const replacement = "export const GET_GN_BY_CCODE = gql`" + testMatch[1] + "`;\n\n";

// Use a regex to remove ALL instances of GET_GN_BY_CCODE
// Matches from `export const GET_GN_BY_CCODE` until the next `export const ` or end of file.
queries = queries.replace(/export const GET_GN_BY_CCODE = gql`[\s\S]*?(?=export const |$)/g, "");

// Append the replacement to the end of the file
queries = queries + "\n" + replacement;

fs.writeFileSync("frontend/src/graphql/queries.ts", queries);
console.log("Successfully cleaned and appended query.");
