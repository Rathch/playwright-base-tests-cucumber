Feature: homepage still exists

    Scenario: Home
        Given I am on the homepage
        Then the responce is "200"
        And I should see a cookie banner "#cmpbox"
        And cookies should not be set before accepting the banner
        And specific cookies should be set after accepting the banner "#cmpbox", with ".cmpboxbtnyes"