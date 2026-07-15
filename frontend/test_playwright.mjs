import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('Districts query:')) {
      msg.args().forEach(async (arg) => {
        console.log(await arg.jsonValue());
      });
    }
  });

  page.on('response', response => {
    if (response.url().includes('graphql')) {
      response.text().then(text => console.log('GraphQL Response:', text.substring(0, 500)));
    }
  });

  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
