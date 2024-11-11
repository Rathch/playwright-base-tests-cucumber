
const {
  Given,
  When,
  Then,
  BeforeAll,
  AfterAll,
  After
} = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const config = require('./../../../config.json');
const mandatoryPages = config.mandatoryPages || ['/'];
const baseURL = config.baseURL || 'https://google.com';
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const xml2js = require('xml2js');
const axios = require('axios');
const generateAccessibilityHtmlReport = (results) => {
  const html = `
    <html>
    <head>
      <title>Accessibility Report</title>
    </head>
    <body>
      <h1>Accessibility Report</h1>
      <pre>${JSON.stringify(results, null, 2)}</pre>
    </body>
    </html>
  `;
  fs.writeFileSync('test-results/accessibility-report.html', html);
};

var world = this;
let browser;
let context;
let page;



BeforeAll(async () => {
  browser = await chromium.launch({   channel:'chrome', 
                                      headless:false, 
                                      slowMo:1})
  context = await browser.newContext();
  page = await context.newPage()
  this.page = page;
})

Then('cookies should not be set before accepting the banner', async function () {
  
  const cookiesBefore = await page.context().cookies();
  expect(cookiesBefore).toHaveLength(config.numberOfMendetoryCoocies);
});

Then('specific cookies should be set after accepting the banner {string}, with {string}', { timeout: 60 * 1000 }, async function (bannerSelector, acceptButtonSelector) {
  const cookiesBefore = await page.context().cookies();

  const acceptButton = page.locator(acceptButtonSelector);
  
  await acceptButton.waitFor({ state: 'visible' });
  await acceptButton.click();
  await page.waitForTimeout(1000);
  const banner = page.locator(bannerSelector);
  const isVisible = await banner.isVisible();
  expect(isVisible).toBe(false);
 

  const cookiesAfter = await page.context().cookies();

  expect(cookiesAfter.length).toBeGreaterThan(cookiesBefore.length);
});

Then('I should see a cookie banner {string}', async function (selector) {
  const banner = await page.locator(selector);
  const isVisible = await banner.isVisible();
  expect(isVisible).toBe(true);
});

Given('I run AXE accesebility TESTS', async function () {
  const accessibilityScanResults = await new AxeBuilder({ page: page })
    .disableRules(['document-title', 'html-has-lang'])
    .analyze();
    
  const resultsFile = path.join('test-results', 'accessibility-report.json');
  fs.writeFileSync(resultsFile, JSON.stringify(accessibilityScanResults, null, 2));

  expect(accessibilityScanResults.violations).toEqual([]);
});



Given('Test accessibility on sitemap',{ timeout: 1200000 }, async function () {
  let urls = [];
  const sitemapUrl = `${baseURL}/sitemap.xml`;
  console.log('Sitemap URL:', sitemapUrl);

  const response = await axios.get(sitemapUrl);
  const result = await xml2js.parseStringPromise(response.data);
  urls = result.urlset.url.map(entry => entry.loc[0]);

  console.log('Extracted URLs:', urls);

  const overallResults = [];

  for (const url of urls) {
    console.log(`Visiting URL: ${url}`);
    await page.goto(url);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['document-title', 'html-has-lang'])
      .analyze();

    overallResults.push({
      url: url,
      violations: accessibilityScanResults.violations,
    });
  }
  const resultsFile = path.join('test-results', 'accessibility-report.json');
  fs.writeFileSync(resultsFile, JSON.stringify(overallResults, null, 2));

  const summary = overallResults.map(result => {
    return {
      url: result.url,
      violationCount: result.violations.length,
      violations: result.violations.map(v => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.length,
      })),
    };
  });

  console.log('Summary of accessibility issues:', summary);
  expect(summary.every(item => item.violationCount === 0)).toBe(true);
});

Given('check for lang', async function () {
  const langAttribute = await page.evaluate(() => {
    return document.documentElement.lang;
  });
  expect(langAttribute).toBeTruthy();
});

Given('check for title', async function () {
  const titleExists = await page.evaluate(() => {
    const titleTag = document.querySelector('title');
    return !!titleTag;
  });

  expect(titleExists).toBe(true);
});

Given('I am on the homepage',{ timeout: 60 * 1000 }, async function () {
  await page.goto(baseURL);
});

Given('I am on {string} page', async function (string) {
  await page.goto(`${baseURL}/${string}`);
});

Then('I see in Headline {string}', async function (string) {
  const headlines = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => el.textContent.trim())
  );

  const headlineFound = headlines.some(headline => headline.includes(string));

  if (headlineFound) {
      return true;
  } else {
      throw new Error(`Expected one of the headlines to contain: ${string}, but none did. Found headlines: ${headlines.join(', ')}`);
  }
});

Then('the response is a sitemap.xml', async function () {
  const response = await page.goto(`${baseURL}/sitemap.xml`);
  if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      if (contentType.includes('application/xml')) {
          const content = await response.text();
          if (content.includes('<urlset')) {
              console.log('Sitemap.xml is correctly configured.');
          } else {
              if(content.includes('XML Sitemap')) {
                console.log('Sitemap.xml is correctly configured.');
              } else {
                throw new Error('Sitemap.xml does not contain expected XML structure.');
              } 
          }
      } else {
        if (content.includes('<urlset')) {
          console.log('Sitemap.xml is correctly configured.');
      } else {
        throw new Error('Sitemap.xml does not have the correct content type.');
      }
          
      }
  } else {
      throw new Error(`Sitemap.xml returned status code: ${response.status()}`);
  }
});


Then('the responce is {string}', { timeout: 60 * 1000 }, async function (expectedStatus) {
  const response = await page.goto(`${baseURL}`, { waitUntil: 'networkidle' });
  const actualStatus = response.status().toString();
  if (actualStatus === expectedStatus) {
    console.log(`Homepage returned expected status code: ${actualStatus}`);
  } else {
    throw new Error(`Expected status code: ${expectedStatus}, but got: ${actualStatus}`);
  }
});


Given('I visit all mandatory pages', { timeout: 60 * 1000 }, async function () {
  for (const pagePath of mandatoryPages) {
    console.log(`Visiting: ${baseURL}${pagePath}`);
    const response = await page.goto(`${baseURL}${pagePath}`, { waitUntil: 'networkidle' });
    

    const status = response.status();
    if (status !== 200) {
      throw new Error(`Page ${baseURL}${pagePath} returned status code: ${status}`);
    } else {
      console.log(`Page ${baseURL}${pagePath} is reachable with status code: ${status}`);
      if (!fs.existsSync('test-results')) {
        fs.mkdirSync('test-results');
      }
    
      const screenshotPath = path.join('test-results', `${pagePath}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    }
  }
});


Then('the response is {string} for {string} page', { timeout: 60 * 1000 }, async function (expectedStatus, pagePath) {
  const response = await page.goto(`${baseURL}${pagePath}`, { waitUntil: 'networkidle' });
  const actualStatus = response.status().toString();
  if (actualStatus !== expectedStatus) {
    throw new Error(`Expected status code for ${pagePath}: ${expectedStatus}, but got: ${actualStatus}`);
  } else {
    console.log(`Page ${pagePath} returned expected status code: ${actualStatus}`);
  }
});


Then('all mandatory pages are linked from the homepage', { timeout: 60 * 1000 }, async function () {
  
  const links = await page.$$eval('a', elements =>
    elements.map(el => el.getAttribute('href')).filter(href => href && href.startsWith('/'))
  );

 
  for (const pagePath of mandatoryPages) {
    if (!links.includes(pagePath)) {
      throw new Error(`Mandatory page ${pagePath} is not linked from the homepage.`);
    } else {
      console.log(`Mandatory page ${pagePath} is correctly linked from the homepage.`);
    }
  }
});

After(async function (scenario) {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
  }

  const screenshotPath = path.join('test-results', `${scenario.pickle.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);

  const resultsFile = path.join('test-results', 'accessibility-report.json');
  if (fs.existsSync(resultsFile)) {
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    generateAccessibilityHtmlReport(results);
  }
});

 
AfterAll(async () => {
  await browser.close();
});

