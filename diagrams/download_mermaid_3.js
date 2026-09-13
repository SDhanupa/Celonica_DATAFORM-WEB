const fs = require('fs');
const https = require('https');

const code = 
graph TD
    A[User Landing Page UserPage.tsx] -->|Selects Location| B((Session Storage GN Name & CCODE))
    
    A -->|Clicks 'Industry Survey'| C[User Dashboard MySubmissionsDashboard.tsx]
    
    C -->|Fetches /api/my-industry-surveys| DB[(Backend Database)]
    DB -->|Returns| D[Draft Surveys List]
    DB -->|Returns| E[Submitted Surveys List]
    C -.-> D
    C -.-> E
    
    C -->|Clicks 'New Industry Survey' Button| F[Industry Survey Form IndustrySurveyPage.tsx]
    
    F -->|Reads Context| B
    F -->|Fills Steps 1-6| G{Action}
    
    G -->|Save Draft| DB
    G -->|Submit Final| DB
    
    G -->|Redirects Back| C
;

const payload = {
  code: code,
  mermaid: { theme: 'default' }
};

const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
const url = 'https://mermaid.ink/img/' + base64;

const file = fs.createWriteStream('4_User_Dashboard_to_Survey_Flow.jpg');
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded: 4_User_Dashboard_to_Survey_Flow.jpg');
  });
});
