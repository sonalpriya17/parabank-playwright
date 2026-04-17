@smoke @regression
Feature: Fund Transfer

  Scenario: Transfer funds from savings account to another account
    Given a new user is registered
    And the user opens a new Savings account
    And the new account should be created successfully
    And the account number should be captured
    When the user transfers "50" dollars from the savings account to another account
    Then the transfer should be completed successfully
