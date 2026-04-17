@smoke @regression
Feature: Account Management

  Scenario: Open a savings account and verify accounts overview
    Given a new user is registered
    When the user opens a new Savings account
    Then the new account should be created successfully
    And the account number should be captured
    When the user navigates to the Accounts Overview page
    Then the accounts overview should display balance details
    And the new savings account should be listed
