const express = require('express');
const { chromium } = require('playwright');
const path = require('path');

const app = express();

app.get('/screenshot', async (req, res) => {
    const city = req.query.city || "Vijayawada";
    const date = req.query.date || "09/04/2024";
    const outputImagePath = path.join(__dirname, 'images', 'screenshot.png');

    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the website
        await page.goto('https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html', { waitUntil: 'networkidle' });

        // Clear the existing city and date values
        await page.evaluate(() => {
            document.getElementById('dp-direct-city-search').value = '';
            document.getElementById('dp-date-picker').value = '';
        });

        // Input the new city and date values
        await page.fill('#dp-direct-city-search', city);
        await page.fill('#dp-date-picker', date);

        // Wait for the date picker to become visible and then click the "Done" button
        await page.waitForSelector('button.ui-datepicker-close.ui-state-default.ui-priority-primary.ui-corner-all', { timeout: 5000 });
        await page.click('button.ui-datepicker-close.ui-state-default.ui-priority-primary.ui-corner-all');

        // Screenshot the specified element
        const element = await page.$('.dpMuhurtaCard.dpFlexEqual');
        await element.screenshot({ path: outputImagePath });

        // Close the browser
        await browser.close();

        // Send the screenshot as a response
        res.sendFile(outputImagePath);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while taking the screenshot.');
    }
});

// Only use port if running locally
if (process.env.NODE_ENV !== 'production') {
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app;
