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
    await this.fromAccountSelect.locator('option').first().waitFor({ state: 'attached' });
    await this.openAccountButton.click();
    await Promise.race([
      this.successHeading.waitFor({ state: 'visible', timeout: 60_000 }),
      this.page.locator('#rightPanel h1.title', { hasText: 'Error' }).waitFor({ state: 'visible', timeout: 60_000 }),
    ]);
    const populatedAccountNumber = this.page.locator('#newAccountId').filter({ hasText: /\d+/ });
    await populatedAccountNumber.waitFor({ state: 'attached', timeout: 30_000 });
    return ((await populatedAccountNumber.textContent()) || '').trim();
  }

  async getNewAccountNumber(): Promise<string> {
    return (await this.newAccountNumber.textContent()) || '';
  }

  async getSuccessMessage(): Promise<string> {
    await this.congratsMessage.waitFor({ state: 'visible' });
    return (await this.congratsMessage.textContent()) || '';
  }
}
