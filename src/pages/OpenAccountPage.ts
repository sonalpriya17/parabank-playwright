import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class OpenAccountPage extends BasePage {
  get accountTypeSelect() { return this.page.locator('#type'); }
  get fromAccountSelect() { return this.page.locator('#fromAccountId'); }
  get openAccountButton() { return this.page.locator('input[value="Open New Account"]'); }
  get successHeading() { return this.page.getByRole('heading', { name: 'Account Opened!' }); }
  get congratsMessage() { return this.page.getByText('Congratulations, your account is now open.'); }
  get newAccountNumber() { return this.page.locator('#newAccountId'); }

  async navigateToOpenAccount(): Promise<void> {
    await this.navigate(Constants.PATHS.OPEN_ACCOUNT);
  }

  async openSavingsAccount(): Promise<string> {
    await this.accountTypeSelect.waitFor({ state: 'visible' });
    await this.accountTypeSelect.selectOption({ value: '1' });
    await this.fromAccountSelect.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000);
    await this.openAccountButton.click();
    await this.newAccountNumber.waitFor({ state: 'visible', timeout: 15_000 });
    const accountNumber = await this.newAccountNumber.textContent();
    return (accountNumber || '').trim();
  }

  async getNewAccountNumber(): Promise<string> {
    return (await this.newAccountNumber.textContent()) || '';
  }

  async getSuccessMessage(): Promise<string> {
    await this.congratsMessage.waitFor({ state: 'visible' });
    return (await this.congratsMessage.textContent()) || '';
  }
}
