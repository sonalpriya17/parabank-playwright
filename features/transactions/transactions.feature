@smoke @regression @api
Feature: Transaction API Verification

  Scenario: Verify bill payment transaction via API
    Given a new user is registered
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
    When the user searches transactions for the account using the API
    Then the API response should contain account transactions
    And the transaction details should be valid
