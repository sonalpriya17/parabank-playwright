@smoke @regression
Feature: User Login

  Scenario: Login with registered credentials
    Given a new user is registered
    When the user logs out
    And the user logs in with the registered credentials
    Then the user should see the Accounts Overview page
