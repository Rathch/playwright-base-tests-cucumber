Feature: check if sitemap exists

    Scenario: /sitemap.xml 
        Given I am on "sitemap.xml" page
        Then the response is a sitemap.xml