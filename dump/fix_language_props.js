const fs = require('fs');
const path = require('path');

const filesToFix = [
  'DemographicCards.tsx',
  'Custom3DBarChart.tsx',
  'AgeDemographicsChart.tsx',
  'GlobalSearchBar.tsx',
  'HousingOwnershipChart.tsx',
  'LocationSelectorModal.tsx',
  'PopulationInfographic.tsx',
  'VillageMap.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join('frontend/src/components', file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if not exists
  if (!content.includes('useLanguage')) {
    content = content.replace(/import React(.*?);/, 'import React;\nimport { useLanguage } from \'../context/LanguageContext\';');
  }

  // Remove language from interface
  content = content.replace(/language(\??):\s*(?:'en'\s*\|\s*'si'\s*\|\s*'ta'|string);\s*\n?/g, '');
  
  // Remove language from destructured props
  content = content.replace(/,\s*language\s*(?:=\s*'en')?\s*(?=[,}])/g, '');
  content = content.replace(/\{(\s*)language\s*(?:=\s*'en')?\s*,/g, '{');

  // Insert useLanguage hook inside component body
  // Try to find the component declaration
  content = content.replace(/(const\s+\w+\s*:\s*React\.FC<.*?>\s*=\s*\([^)]*\)\s*=>\s*\{)/, '\n  const { language } = useLanguage();');
  // Or standard function
  content = content.replace(/(function\s+\w+\([^)]*\)\s*\{)/, '\n  const { language } = useLanguage();');

  fs.writeFileSync(filePath, content);
  console.log('Fixed', file);
});

