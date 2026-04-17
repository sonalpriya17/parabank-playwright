@smoke @regression
Feature: Global Navigation Menu

  Scenario: Verify global navigation menu links are working
    Given a new user is registered
    Then the global navigation menu should contain the following links
      | linkText            |
      | Open New Account    |
      | Accounts Overview   |
      | Transfer Funds      |
      | Bill Pay            |
      | Find Transactions   |
      | Update Contact Info |
      | Request Loan        |
      | Log Out             |
    And each navigation link should navigate to the correct page
