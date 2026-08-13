const fs = require("fs");
let content = fs.readFileSync("frontend/src/api/apolloClient.ts", "utf8");
content = content.replace("async function getGuestToken() {", "export async function getGuestToken() {");
fs.writeFileSync("frontend/src/api/apolloClient.ts", content);
console.log("Exported getGuestToken");
