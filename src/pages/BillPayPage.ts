import { BasePage } from './BasePage';
import { BillPayeeData } from '../data/types';
import { Constants } from '../common/Constants';

export class BillPayPage extends BasePage {
  get payeeNameInput() { return this.page.locator('input[name="payee.name"]'); }
  get addressInput() { return this.page.locator('input[name="payee.address.street"]'); }
  get cityInput() { return this.page.locator('input[name="payee.address.city"]'); }
  get stateInput() { return this.page.locator('input[name="payee.address.state"]'); }
  get zipCodeInput() { return this.page.locator('input[name="payee.address.zipCode"]'); }
  get phoneInput() { return this.page.locator('input[name="payee.phoneNumber"]'); }
  get accountInput() { return this.page.locator('input[name="payee.accountNumber"]'); }
  get verifyAccountInput() { return this.page.locator('input[name="verifyAccount"]'); }
  get amountInput() { return this.page.locator('input[name="amount"]'); }
  get fromAccountSelect() { return this.page.locator('select[name="fromAccountId"]'); }
  get sendPaymentButton() { return this.page.locator('input[value="Send Payment"]'); }
  get successHeading() { return this.page.getByRole('heading', { name: 'Bill Payment Complete' }); }
  get successDetails() { return this.page.locator('#rightPanel p').first(); }

  async navigateToBillPay(): Promise<void> {
    await this.navigate(Constants.PATHS.BILL_PAY);
  }

  async payBill(payee: BillPayeeData, fromAccount: string): Promise<void> {
    await this.payeeNameInput.waitFor({ state: 'visible' });
    await this.payeeNameInput.fill(payee.name);
    await this.addressInput.fill(payee.address);
    await this.cityInput.fill(payee.city);
    await this.stateInput.fill(payee.state);
    await this.zipCodeInput.fill(payee.zipCode);
    await this.phoneInput.fill(payee.phone);
    await this.accountInput.fill(payee.accountNumber);
    await this.verifyAccountInput.fill(payee.verifyAccountNumber);
    await this.amountInput.fill(payee.amount);
    await this.fromAccountSelect.selectOption(fromAccount);
    await this.sendPaymentButton.click();
    await Promise.race([
      this.successHeading.waitFor({ state: 'visible', timeout: 60_000 }),
      this.serverErrorHeading.waitFor({ state: 'visible', timeout: 60_000 }),
    ]);
  }

  async getSuccessDetails(): Promise<string> {
    return (await this.successDetails.textContent()) || '';
  }
}
