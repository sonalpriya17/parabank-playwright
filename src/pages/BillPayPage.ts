import { BasePage } from './BasePage';
import { BillPayeeData } from '../data/types';
import { Constants } from '../common/Constants';

export class BillPayPage extends BasePage {
  private readonly payeeNameInput = () =>
    this.page.locator('input[name="payee.name"]');
  private readonly addressInput = () =>
    this.page.locator('input[name="payee.address.street"]');
  private readonly cityInput = () =>
    this.page.locator('input[name="payee.address.city"]');
  private readonly stateInput = () =>
    this.page.locator('input[name="payee.address.state"]');
  private readonly zipCodeInput = () =>
    this.page.locator('input[name="payee.address.zipCode"]');
  private readonly phoneInput = () =>
    this.page.locator('input[name="payee.phoneNumber"]');
  private readonly accountInput = () =>
    this.page.locator('input[name="payee.accountNumber"]');
  private readonly verifyAccountInput = () =>
    this.page.locator('input[name="verifyAccount"]');
  private readonly amountInput = () =>
    this.page.locator('input[name="amount"]');
  private readonly fromAccountSelect = () =>
    this.page.locator('select[name="fromAccountId"]');
  private readonly sendPaymentButton = () =>
    this.page.locator('input[value="Send Payment"]');
  private readonly successHeading = () =>
    this.page.getByRole('heading', { name: 'Bill Payment Complete' });
  private readonly successDetails = () =>
    this.page.locator('#rightPanel p').first();

  async navigateToBillPay(): Promise<void> {
    await this.navigate(Constants.PATHS.BILL_PAY);
  }

  async payBill(payee: BillPayeeData, fromAccount: string): Promise<void> {
    await this.payeeNameInput().waitFor({ state: 'visible' });
    await this.payeeNameInput().fill(payee.name);
    await this.addressInput().fill(payee.address);
    await this.cityInput().fill(payee.city);
    await this.stateInput().fill(payee.state);
    await this.zipCodeInput().fill(payee.zipCode);
    await this.phoneInput().fill(payee.phone);
    await this.accountInput().fill(payee.accountNumber);
    await this.verifyAccountInput().fill(payee.verifyAccountNumber);
    await this.amountInput().fill(payee.amount);
    await this.fromAccountSelect().selectOption(fromAccount);
    await this.sendPaymentButton().click();
  }

  async isPaymentSuccessful(): Promise<boolean> {
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

  async getSuccessDetails(): Promise<string> {
    return (await this.successDetails().textContent()) || '';
  }
}
