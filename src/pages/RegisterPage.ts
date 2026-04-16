import { BasePage } from './BasePage';
import { UserData } from '../data/types';
import { Constants } from '../common/Constants';

export class RegisterPage extends BasePage {
  get firstNameInput() { return this.page.locator('#customer\\.firstName'); }
  get lastNameInput() { return this.page.locator('#customer\\.lastName'); }
  get addressInput() { return this.page.locator('#customer\\.address\\.street'); }
  get cityInput() { return this.page.locator('#customer\\.address\\.city'); }
  get stateInput() { return this.page.locator('#customer\\.address\\.state'); }
  get zipCodeInput() { return this.page.locator('#customer\\.address\\.zipCode'); }
  get phoneInput() { return this.page.locator('#customer\\.phoneNumber'); }
  get ssnInput() { return this.page.locator('#customer\\.ssn'); }
  get usernameInput() { return this.page.locator('#customer\\.username'); }
  get passwordInput() { return this.page.locator('#customer\\.password'); }
  get confirmPasswordInput() { return this.page.locator('#repeatedPassword'); }
  get registerButton() { return this.page.locator('input[value="Register"]'); }
  get welcomeMessage() { return this.page.locator('#rightPanel h1.title').first(); }
  get successMessage() { return this.page.locator('#rightPanel p').first(); }

  async navigateToRegister(): Promise<void> {
    await this.navigate(Constants.PATHS.REGISTER);
  }

  async register(user: UserData): Promise<void> {
    await this.firstNameInput.waitFor({ state: 'visible' });
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.addressInput.fill(user.address);
    await this.cityInput.fill(user.city);
    await this.stateInput.fill(user.state);
    await this.zipCodeInput.fill(user.zipCode);
    await this.phoneInput.fill(user.phone);
    await this.ssnInput.fill(user.ssn);
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.confirmPassword);
    await this.registerButton.click();
  }

  async getWelcomeTitle(): Promise<string> {
    await this.welcomeMessage.waitFor({ state: 'visible' });
    return (await this.welcomeMessage.textContent()) || '';
  }

  async getSuccessText(): Promise<string> {
    return (await this.successMessage.first().textContent()) || '';
  }
}
