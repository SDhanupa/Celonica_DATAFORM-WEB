const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/xampp/htdocs/Celonica Quecion web/frontend/public/data/locations.json', 'utf8'));
const codeMap = {};
data.forEach(d => {
  if (d.cities) {
    d.cities.forEach(c => {
      if (!codeMap[c.dsCode]) {
        codeMap[c.dsCode] = [];
      }
      codeMap[c.dsCode].push(c.dsEn);
    });
  }
});
for (const code in codeMap) {
  if (codeMap[code].length > 1) {
    console.log(`Duplicate dsCode ${code}:`, codeMap[code]);
  }
}
