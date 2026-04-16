import { BasePage } from './BasePage';
import { UserData } from '../data/types';
import { Constants } from '../common/Constants';

export class RegisterPage extends BasePage {
  private readonly firstNameInput = () =>
    this.page.locator('#customer\\.firstName');
  private readonly lastNameInput = () =>
    this.page.locator('#customer\\.lastName');
  private readonly addressInput = () =>
    this.page.locator('#customer\\.address\\.street');
  private readonly cityInput = () =>
    this.page.locator('#customer\\.address\\.city');
  private readonly stateInput = () =>
    this.page.locator('#customer\\.address\\.state');
  private readonly zipCodeInput = () =>
    this.page.locator('#customer\\.address\\.zipCode');
  private readonly phoneInput = () =>
    this.page.locator('#customer\\.phoneNumber');
  private readonly ssnInput = () => this.page.locator('#customer\\.ssn');
  private readonly usernameInput = () =>
    this.page.locator('#customer\\.username');
  private readonly passwordInput = () =>
    this.page.locator('#customer\\.password');
  private readonly confirmPasswordInput = () =>
    this.page.locator('#repeatedPassword');
  private readonly registerButton = () =>
    this.page.locator('input[value="Register"]');
  private readonly welcomeMessage = () =>
    this.page.locator('#rightPanel h1.title').first();
  private readonly successMessage = () =>
    this.page.locator('#rightPanel p').first();

  async navigateToRegister(): Promise<void> {
    await this.navigate(Constants.PATHS.REGISTER);
  }

  async register(user: UserData): Promise<void> {
    await this.firstNameInput().waitFor({ state: 'visible' });
    await this.firstNameInput().fill(user.firstName);
    await this.lastNameInput().fill(user.lastName);
    await this.addressInput().fill(user.address);
    await this.cityInput().fill(user.city);
    await this.stateInput().fill(user.state);
    await this.zipCodeInput().fill(user.zipCode);
    await this.phoneInput().fill(user.phone);
    await this.ssnInput().fill(user.ssn);
    await this.usernameInput().fill(user.username);
    await this.passwordInput().fill(user.password);
    await this.confirmPasswordInput().fill(user.confirmPassword);
    await this.registerButton().click();
  }

  async getWelcomeTitle(): Promise<string> {
    await this.welcomeMessage().waitFor({ state: 'visible' });
    return (await this.welcomeMessage().textContent()) || '';
  }

  async getSuccessText(): Promise<string> {
    return (await this.successMessage().first().textContent()) || '';
  }

  async isRegistrationSuccessful(): Promise<boolean> {
    const title = await this.getWelcomeTitle();
    return title.includes('Welcome');
  }
}
