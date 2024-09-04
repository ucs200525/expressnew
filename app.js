const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.get('/screenshot', async (req, res) => {
    const city = req.query.city || "Vijayawada";
    const date = req.query.date || "09/04/2024";
    const outputImagePath = path.join(__dirname, 'images', 'screenshot.png');

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the website
        await page.goto('https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html', { waitUntil: 'networkidle2' });

        // Clear the existing city and date values
        await page.evaluate(() => {
            document.getElementById('dp-direct-city-search').value = '';
            document.getElementById('dp-date-picker').value = '';
        });

        // Input the new city and date values
        await page.type('#dp-direct-city-search', city);
        await page.type('#dp-date-picker', date);

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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
