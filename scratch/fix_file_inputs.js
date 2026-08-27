const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'IndustrySurveyPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix broken file input onChange handlers: "     } />" → "     }} />"
// These are inside <input type="file" ... onChange={(e) => { ... } />
// They always follow a closing brace of an if block
const before = content;
content = content.replace(
  /( {5,10})\} \/>\r?\n(\s*<\/Button>)/g,
  '$1}} />\n$2'
);

if (content === before) {
  console.log('No changes made - pattern not found. Trying alternate fix...');
  // Try finding the exact broken pattern
  const matches = [...content.matchAll(/\n     \} \/>/g)];
  console.log(`Found ${matches.length} matches of "     } />"`);
  matches.forEach((m, i) => {
    console.log(`Match ${i}: at position ${m.index}, context: "${content.substring(m.index - 30, m.index + 20)}"`);
  });
} else {
  const count = (before.match(/( {5,10})\} \/>/g) || []).length;
  console.log(`Fixed ${count} broken onChange handler(s).`);
}

fs.writeFileSync(filePath, content, 'utf8');
