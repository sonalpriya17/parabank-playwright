@smoke @regression
Feature: User Login

  Scenario: Login with registered credentials
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
    When the user logs out
    And the user logs in with the registered credentials
    Then the user should see the Accounts Overview page
