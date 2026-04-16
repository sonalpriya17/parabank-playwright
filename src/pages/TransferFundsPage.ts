import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class TransferFundsPage extends BasePage {
  private readonly amountInput = () => this.page.locator('#amount');
  private readonly fromAccountSelect = () =>
    this.page.locator('#fromAccountId');
  private readonly toAccountSelect = () =>
    this.page.locator('#toAccountId');
  private readonly transferButton = () =>
    this.page.locator('input[value="Transfer"]');
  private readonly successHeading = () =>
    this.page.getByRole('heading', { name: 'Transfer Complete!' });

  async navigateToTransferFunds(): Promise<void> {
    await this.navigate(Constants.PATHS.TRANSFER_FUNDS);
  }

  async transferFunds(
    amount: string,
    fromAccount: string,
    toAccount: string
  ): Promise<void> {
    await this.amountInput().waitFor({ state: 'visible' });
    await this.amountInput().fill(amount);
    await this.fromAccountSelect().selectOption(fromAccount);
    await this.page.waitForTimeout(500);
    await this.toAccountSelect().selectOption(toAccount);
    await this.transferButton().click();
  }

  async isTransferSuccessful(): Promise<boolean> {
    try {
      await this.successHeading().waitFor({ state: 'visible', timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  async getSuccessMessage(): Promise<string> {
    await this.successHeading().waitFor({ state: 'visible' });
    return (await this.successHeading().textContent()) || '';
  }

  async getFromAccountOptions(): Promise<string[]> {
    await this.fromAccountSelect().waitFor({ state: 'visible' });
    await this.fromAccountSelect().locator('option').first().waitFor({ state: 'attached', timeout: 10_000 });
    const options = this.fromAccountSelect().locator('option');
    return options.allTextContents();
  }

  async getToAccountOptions(): Promise<string[]> {
    await this.toAccountSelect().waitFor({ state: 'visible' });
    await this.toAccountSelect().locator('option').first().waitFor({ state: 'attached', timeout: 10_000 });
    const options = this.toAccountSelect().locator('option');
    return options.allTextContents();
  }
}
