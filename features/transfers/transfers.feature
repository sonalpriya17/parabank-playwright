@smoke @regression
Feature: Fund Transfer

  Scenario: Transfer funds from savings account to another account
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
    And the user opens a new Savings account
    And the new account should be created successfully
    And the account number should be captured
    When the user transfers "50" dollars from the savings account to another account
    Then the transfer should be completed successfully
