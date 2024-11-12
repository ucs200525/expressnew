const express = require('express');
const path = require('path');
const { chromium } = require('playwright');

const app = express();
const port = 3000;

// Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname)));

// Screenshot route
app.get('/screenshot', async (req, res) => {
    const city = req.query.city || "Vijayawada";
    const date = req.query.date || "09/04/2024";
    const outputImagePath = path.join(__dirname, 'screenshot.png');

    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        await page.goto('https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html', { waitUntil: 'networkidle' });

        await page.evaluate(() => {
            document.getElementById('dp-direct-city-search').value = '';
            document.getElementById('dp-date-picker').value = '';
        });

        await page.fill('#dp-direct-city-search', city);
        await page.fill('#dp-date-picker', date);
        
        await page.waitForSelector('button.ui-datepicker-close.ui-state-default.ui-priority-primary.ui-corner-all', { timeout: 5000 });
        await page.click('button.ui-datepicker-close.ui-state-default.ui-priority-primary.ui-corner-all');

        const element = await page.$('.dpMuhurtaCard.dpFlexEqual');
        await element.screenshot({ path: outputImagePath });
        await browser.close();

        res.sendFile(outputImagePath);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while taking the screenshot.');
    }
});

// Listen on specified port (useful for local testing)
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
