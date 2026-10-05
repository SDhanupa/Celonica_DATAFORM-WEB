const fs = require('fs');
const missing = fs.readFileSync('missing_steps.txt', 'utf8');
const file = 'frontend/src/pages/IndustrySurveyPage.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/({\[2, 3, 4, 5, 6, 7, 8\]\.includes\(currentStep\) && renderDynamicStep\(currentStep\)}[\s\S]*?)({currentStep === 13)/, "$1" + missing + "\n              $2");
fs.writeFileSync(file, content, 'utf8');
console.log('Inserted missing steps successfully!');
