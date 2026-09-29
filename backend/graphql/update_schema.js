const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.graphql');
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Update Question type
const questionTypeRegex = /(type Question \{[^}]*?questionTextTa:[^\n]*\n)/;
if (content.match(questionTypeRegex) && !content.includes('explanationEn')) {
    content = content.replace(questionTypeRegex, `$1    explanationEn: String @rename(attribute: "explanation_en")\n    explanationSi: String @rename(attribute: "explanation_si")\n    explanationTa: String @rename(attribute: "explanation_ta")\n`);
}

// 2. Update updateQuestion mutation
const updateQuestionRegex = /(updateQuestion\([\s\S]*?questionTextSi: String @rename\(attribute: "question_text_si"\))/;
if (content.match(updateQuestionRegex) && !content.includes('explanationEn: String @rename')) {
    content = content.replace(updateQuestionRegex, `$1\n        explanationEn: String @rename(attribute: "explanation_en")\n        explanationSi: String @rename(attribute: "explanation_si")\n        explanationTa: String @rename(attribute: "explanation_ta")`);
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Successfully updated schema.graphql');
