# Playwright Base Tests with Cucumber

## Template to Start Playwright Cucumber Website Testing

Base tests with Playwright and Gherkin Cucumber, highly inspired by [this repository](https://github.com/ncatestify/cypressio-base/tree/main).

## Prerequisites

Install Node.js: see [Node.js official website](https://nodejs.org/en)

## Installation

```bash
git clone https://github.com/Rathch/playwright-base-tests-cucumber
cd playwright-base-tests-cucumber
npm i
```

## Replace the Target URL

In the `config.json` at the root level, replace the target URL by including the full URL with protocol. This ensures that all tests will run based on this URL.

### Configuration of Mandatory Pages

The list of mandatory pages to be tested is configurable via the `config.json` file. Each mandatory page will be checked for accessibility and to ensure it is linked from the homepage. To add or modify mandatory pages, update the list under the `mandatoryPages` key in the `config.json`.

#### Example configuration

```json
{
  "baseURL": "https://example.com",
  "mandatoryPages": [
    "/impressum",
    "/privacy-policy",
    "/contact"
  ]
}
```

## run command

```bash
npm run test
```

wil execute the tests from the test/features dir

## Adding Your Own Tests

You can add your own tests in `src/tests/features`. These should be named in the format `testname.feature` and written in Gherkin syntax. See [Gherkin Documentation](https://cucumber.io/docs/gherkin/).

You can use the existing test steps to cover most test scenarios.

### List of Existing Test Steps

- `'I am on "/testpage" page'`
  - This step ensures that the page at `baseurl/testpage` is visited, e.g., `http://www.example.com/testpage`
- `'I see in Headline "Testheadline"'`
  - This step searches the page for the given string in an `h1` to `h6` tag

## Test Step Definitions

The existing test step definitions are written in a general way to cover most cases. Therefore, simple test steps can be combined to create more complex tests. To enable this, individual test steps should be used generically. For example, instead of using a detailed step like:

- `Given I click on "contact" in the menu and then fill out the contact form`

Use more general steps:

- `Given I am on "contact"`
- `And I fill "firstname" with "Bob"`
- `And I fill "lastname" with "Builder"`
- `And I click on "submit"`

## Adding Custom Test Steps

Custom test step definitions should follow the schema described above.

In the `Steps` folder, you can add your own test steps. It is recommended to create a separate file, such as `mySteps.js`. For guidance on imports, you can refer to the `steps.js` file. Missing steps can also be contributed as pull requests.
