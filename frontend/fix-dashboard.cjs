const fs = require("fs");
let content = fs.readFileSync("frontend/src/pages/UserDashboard.tsx", "utf8");

// Fix 1: District dropdown match
content = content.replace(
  /d\.nameEn === activeGn\.pDistrict\?\.nameEn \|\|\s+d\.nameEn === activeGn\.pDistrict\?\.nameEn/g,
  "d.nameEn === (activeGn.pDistrict?.admin2NameEn || activeGn.pDistrict?.nameEn)"
);

// Fix 2: Dropdown sync loop
content = content.replace(
  /if \(activeGn\.dsCode \|\| activeGn\.dsEn\) \{\s*setSelectedCity\(activeGn\.dsCode \|\| activeGn\.dsEn\);\s*\}/g,
  "if (activeGn.dsEn && !selectedCity) { setSelectedCity(activeGn.dsEn); }"
);

// Fix 3: Modal Continue button logic
content = content.replace(
  /let loadedGn: any = null;\s*if \(activeGn\) \{\s*loadedGn = activeGn;\s*\} else if \(showManualForm && selectedGN && gnData\?\.pDistrict\?\.gramaNiladharis\) \{\s*loadedGn = gnData\.pDistrict\.gramaNiladharis\.find\(\(x: any\) => x\.id === selectedGN\);\s*\}/g,
  `let loadedGn: any = null;
              if (selectedGN && gnData?.pDistrict?.gramaNiladharis) {
                loadedGn = gnData.pDistrict.gramaNiladharis.find((x: any) => x.id === selectedGN || x.ccode === selectedGN || x.CCODE === selectedGN);
              }
              if (!loadedGn && activeGn) {
                loadedGn = activeGn;
              }`
);

fs.writeFileSync("frontend/src/pages/UserDashboard.tsx", content);
console.log("Fixes applied successfully.");
