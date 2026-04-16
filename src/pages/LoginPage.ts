import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class LoginPage extends BasePage {
  get usernameInput() { return this.page.locator('div.login input[name="username"]'); }
  get passwordInput() { return this.page.locator('div.login input[name="password"]'); }
  get loginButton() { return this.page.locator('div.login input[value="Log In"]'); }
  get accountsOverviewHeading() { return this.page.getByRole('heading', { name: 'Accounts Overview' }); }
  get errorMessage() { return this.page.locator('#rightPanel .error'); }

  async navigateToLogin(): Promise<void> {
    await this.navigate(Constants.PATHS.HOME);
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getPageHeading(): Promise<string> {
    await this.accountsOverviewHeading.waitFor({ state: 'visible' });
    return (await this.accountsOverviewHeading.textContent()) || '';
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }
}
