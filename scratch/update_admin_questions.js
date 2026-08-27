const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'QuestionsPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add fields to initial formData
content = content.replace(
  /questionTextTa: '',/g,
  `questionTextTa: '',\n      explanationEn: '',\n      explanationSi: '',\n      explanationTa: '',`
);

// 2. Add fields to setFormData in handleOpen (editing)
content = content.replace(
  /questionTextTa: question\.questionTextTa \|\| '',/g,
  `questionTextTa: question.questionTextTa || '',\n          explanationEn: question.explanationEn || '',\n          explanationSi: question.explanationSi || '',\n          explanationTa: question.explanationTa || '',`
);

// 3. Add UI TextFields for Explanations
const explanationFields = `
              <TextField
                label="Explanation (English)"
                name="explanationEn"
                value={formData.explanationEn}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Explanation (Sinhala)"
                name="explanationSi"
                value={formData.explanationSi}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Explanation (Tamil)"
                name="explanationTa"
                value={formData.explanationTa}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
`;

content = content.replace(
  /(<TextField\s+label="Question Text \(Tamil\)"\s+name="questionTextTa"[\s\S]*?\/>)/,
  `$1${explanationFields}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added explanation fields to QuestionsPage.tsx');
