const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new' 
    });
    const page = await browser.newPage();
    
    // Intercept console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('3dish_user', JSON.stringify({ role: 'vendor', uid: 'test', email: 'test@test.com' }));
    });

    console.log('Navigating to vendor page...');
    await page.goto('http://localhost:5173/vendor', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
    console.log('Done.');
  } catch (err) {
    console.error('Script error:', err);
  }
})();
