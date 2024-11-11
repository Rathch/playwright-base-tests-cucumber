Feature: Test mandatory pages

  Scenario: Test all mandatory pages
    Given I visit all mandatory pages
  
  Scenario: Verify all mandatory pages are linked
    Given I am on the homepage
    Then all mandatory pages are linked from the homepage