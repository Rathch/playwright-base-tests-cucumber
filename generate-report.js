const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');


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


const options = {
  theme: 'bootstrap',
  jsonFile: 'test-results/cucumber-report.json',
  output: 'test-results/cucumber-report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
  screenshotsDirectory: 'test-results/',
  storeScreenshots: true,
  metadata: {
    "Browser": "Chrome",
    "Platform": "Windows",
    "Executed": "Local"
  }
};


reporter.generate(options);


const resultsFile = path.join('test-results', 'accessibility-report.json');
if (fs.existsSync(resultsFile)) {
  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  generateAccessibilityHtmlReport(results);
}
