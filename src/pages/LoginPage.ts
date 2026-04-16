import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class LoginPage extends BasePage {
  private readonly usernameInput = () =>
    this.page.locator('div.login input[name="username"]');
  private readonly passwordInput = () =>
    this.page.locator('div.login input[name="password"]');
  private readonly loginButton = () =>
    this.page.locator('div.login input[value="Log In"]');
  private readonly accountsOverviewHeading = () =>
    this.page.getByRole('heading', { name: 'Accounts Overview' });
  private readonly errorMessage = () =>
    this.page.locator('#rightPanel .error');

  async navigateToLogin(): Promise<void> {
    await this.navigate(Constants.PATHS.HOME);
    await this.usernameInput().waitFor({ state: 'visible' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }

  async getPageHeading(): Promise<string> {
    await this.accountsOverviewHeading().waitFor({ state: 'visible' });
    return (await this.accountsOverviewHeading().textContent()) || '';
  }

  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.accountsOverviewHeading().waitFor({
        state: 'visible',
        timeout: 10_000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage().textContent()) || '';
  }
}
