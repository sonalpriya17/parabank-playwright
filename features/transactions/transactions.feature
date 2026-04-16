@smoke @regression @api
Feature: Transaction API Verification

  Scenario: Verify bill payment transaction via API
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
    And the user pays a bill with the following details
      | PARAM               | VALUE             |
      | name                | Utility Company   |
      | address             | 123 Bill St       |
      | city                | Billing City      |
      | state               | CA                |
      | zipCode             | 90210             |
      | phone               | 5551234567        |
      | accountNumber       | 12345             |
      | verifyAccountNumber | 12345             |
      | amount              | 50                |
    And the bill payment should be completed successfully
    And the payment amount should be captured for API verification
    When the user searches transactions by amount using the API
    Then the API response should contain the bill payment transaction
    And the transaction details should match the payment data
