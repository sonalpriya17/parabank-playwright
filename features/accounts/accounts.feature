@smoke @regression
Feature: Account Management

  Scenario: Open a savings account and verify accounts overview
    Given the ParaBank application is open
    And the user navigates to the registration page
    And the user registers with the following details
      | PARAM           | VALUE             |
      | firstName       | <generated>       |
      | lastName        | <generated>       |
      | address         | <generated>       |
      | city            | <generated>       |
      | state           | <generated>       |
      | zipCode         | <generated>       |
      | phone           | <generated>       |
      | ssn             | <generated>       |
      | username        | user_<sessionKey> |
      | password        | Test@1234         |
      | confirmPassword | Test@1234         |
    And the registration confirmation is displayed
    When the user opens a new Savings account
    Then the new account should be created successfully
    And the account number should be captured
    When the user navigates to the Accounts Overview page
    Then the accounts overview should display balance details
    And the new savings account should be listed
