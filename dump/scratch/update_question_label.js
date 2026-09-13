const fs = require('fs');

const filePath = 'frontend/src/pages/IndustrySurveyPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove the old QuestionLabel
const oldQuestionLabelRegex = /const QuestionLabel = \(\{ text, tooltipText \}: \{ text: string, tooltipText\?: string \}\) => \(\s*<Box sx=\{\{ display: 'flex', alignItems: 'center', mb: 1 \}\}>\s*<Typography variant="subtitle1" fontWeight="600" mb=\{0\}>\{text\}<\/Typography>\s*<Tooltip title=\{tooltipText \|\| "Explanation will be added soon"\} arrow>\s*<IconButton size="small" sx=\{\{ ml: 0\.5, p: 0 \}\}>\s*<HelpOutlineIcon fontSize="small" color="action" \/>\s*<\/IconButton>\s*<\/Tooltip>\s*<\/Box>\s*\);\s*/m;

content = content.replace(oldQuestionLabelRegex, '');

// 2. Insert the new QuestionLabel inside IndustrySurveyPage
const newQuestionLabelCode = `
  const QuestionLabel = ({ text }: { text: string }) => {
    const q = questions.find((q: any) => q.questionTextEn === text || q.questionTextSi === text || q.questionTextTa === text);
    let explanation = "Explanation will be added soon";
    if (q) {
      const exp = language === 'si' ? q.explanationSi : language === 'ta' ? q.explanationTa : q.explanationEn;
      if (exp) explanation = exp;
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="600" mb={0}>{text}</Typography>
        <Tooltip title={explanation} arrow>
          <IconButton size="small" sx={{ ml: 0.5, p: 0 }}><HelpOutlineIcon fontSize="small" color="action" /></IconButton>
        </Tooltip>
      </Box>
    );
  };
`;

content = content.replace(
  /const questions = \(data\?\.questions \|\| \[\]\)\.filter\(\(q: any\) => q\.section === 'INDUSTRY_SURVEY'\)\.sort\(\(a: any, b: any\) => a\.sortOrder - b\.sortOrder\);/g,
  `const questions = (data?.questions || []).filter((q: any) => q.section === 'INDUSTRY_SURVEY').sort((a: any, b: any) => a.sortOrder - b.sortOrder);\n${newQuestionLabelCode}`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully moved and updated QuestionLabel');
