const fs = require("fs");
let content = fs.readFileSync("frontend/src/pages/UserDashboard.tsx", "utf8");

content = content.replace(
  /const dsData = uniqueCities\.find\(\(c: any\) => c\.dsEn === activeGn\.dsEn \|\| c\.dsSi === activeGn\.dsSi\);/g,
  `let dsData = null;
          districtsData?.pDistricts?.forEach((d: any) => {
            if (!dsData && d.cities) {
              dsData = d.cities.find((c: any) => c.dsEn === activeGn.dsEn || c.dsSi === activeGn.dsSi);
            }
          });`
);

fs.writeFileSync("frontend/src/pages/UserDashboard.tsx", content);
console.log("City fix 2 applied.");
