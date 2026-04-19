import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class TransferFundsPage extends BasePage {
  get amountInput() { return this.page.locator('#amount'); }
  get fromAccountSelect() { return this.page.locator('#fromAccountId'); }
  get toAccountSelect() { return this.page.locator('#toAccountId'); }
  get transferButton() { return this.page.locator('input[value="Transfer"]'); }
  get successHeading() { return this.page.getByRole('heading', { name: 'Transfer Complete!' }); }

  async navigateToTransferFunds(): Promise<void> {
    await this.navigate(Constants.PATHS.TRANSFER_FUNDS);
  }

  async transferFunds(
    amount: string,
    fromAccount: string,
    toAccount: string
  ): Promise<void> {
    await this.amountInput.waitFor({ state: 'visible' });
    await this.amountInput.fill(amount);
    await this.fromAccountSelect.selectOption(fromAccount);
    await this.toAccountSelect.locator('option').first().waitFor({ state: 'attached' });
    await this.toAccountSelect.selectOption(toAccount);
    await this.transferButton.click();
    await Promise.race([
      this.successHeading.waitFor({ state: 'visible', timeout: 60_000 }),
      this.serverErrorHeading.waitFor({ state: 'visible', timeout: 60_000 }),
    ]);
  }

  async getFromAccountOptions(): Promise<string[]> {
    await this.fromAccountSelect.waitFor({ state: 'visible' });
    await this.fromAccountSelect.locator('option').first().waitFor({ state: 'attached', timeout: 10_000 });
    return this.fromAccountSelect.locator('option').allTextContents();
  }

  async getToAccountOptions(): Promise<string[]> {
    await this.toAccountSelect.waitFor({ state: 'visible' });
    await this.toAccountSelect.locator('option').first().waitFor({ state: 'attached', timeout: 10_000 });
    return this.toAccountSelect.locator('option').allTextContents();
  }
}
