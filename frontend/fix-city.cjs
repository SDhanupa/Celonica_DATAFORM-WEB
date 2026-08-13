const fs = require("fs");
let content = fs.readFileSync("frontend/src/pages/UserDashboard.tsx", "utf8");

content = content.replace(
  /if \(activeGn\.dsEn && !selectedCity\) \{ setSelectedCity\(activeGn\.dsEn\); \}/g,
  `if (activeGn.dsEn) {
          const dsData = uniqueCities.find((c: any) => c.dsEn === activeGn.dsEn || c.dsSi === activeGn.dsSi);
          if (dsData && dsData.dsCode) {
            setSelectedCity(dsData.dsCode);
          }
        }`
);

fs.writeFileSync("frontend/src/pages/UserDashboard.tsx", content);
console.log("City fix applied.");
