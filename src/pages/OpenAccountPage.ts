import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class OpenAccountPage extends BasePage {
  private readonly accountTypeSelect = () =>
    this.page.locator('#type');
  private readonly fromAccountSelect = () =>
    this.page.locator('#fromAccountId');
  private readonly openAccountButton = () =>
    this.page.locator('input[value="Open New Account"]');
  private readonly successHeading = () =>
    this.page.getByRole('heading', { name: 'Account Opened!' });
  private readonly congratsMessage = () =>
    this.page.getByText('Congratulations, your account is now open.');
  private readonly newAccountNumber = () =>
    this.page.locator('#newAccountId');

  async navigateToOpenAccount(): Promise<void> {
    await this.navigate(Constants.PATHS.OPEN_ACCOUNT);
  }

  async openSavingsAccount(): Promise<string> {
    await this.accountTypeSelect().waitFor({ state: 'visible' });
    await this.accountTypeSelect().selectOption({ value: '1' });
    await this.fromAccountSelect().waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000);
    await this.openAccountButton().click();
    await this.newAccountNumber().waitFor({ state: 'visible', timeout: 15_000 });
    const accountNumber = await this.newAccountNumber().textContent();
    return (accountNumber || '').trim();
  }

  async isAccountCreated(): Promise<boolean> {
    try {
      await this.successHeading().waitFor({ state: 'visible', timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  async getNewAccountNumber(): Promise<string> {
    return (await this.newAccountNumber().textContent()) || '';
  }

  async getSuccessMessage(): Promise<string> {
    await this.congratsMessage().waitFor({ state: 'visible' });
    return (await this.congratsMessage().textContent()) || '';
  }
}
