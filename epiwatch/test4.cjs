const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
        console.log('PAGE ERROR LOG:', msg.text());
    } else {
        console.log('PAGE LOG:', msg.text());
    }
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:5177/map');
  await new Promise(r => setTimeout(r, 4000));
  const text = await page.content();
  console.log('Body length:', text.length);
  if (text.includes('Cannot read properties of null')) {
      console.log('CRASH STILL HAPPENING');
  }
  await browser.close();
})();