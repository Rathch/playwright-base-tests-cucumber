Feature: Check page for accesebility errors

    Scenario: run automatic axe tests
        Given Test accessibility on sitemap
        And check for title
        And check for lang
        And I run AXE accesebility TESTS

