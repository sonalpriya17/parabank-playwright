import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class AccountsOverviewPage extends BasePage {
  get pageTitle() { return this.page.getByRole('heading', { name: 'Accounts Overview' }); }
  get accountsTable() { return this.page.locator('#accountTable'); }
  get accountRows() { return this.page.locator('#accountTable tbody tr'); }
  get totalRow() { return this.page.locator('#accountTable tr', { hasText: 'Total' }); }
  get totalBalance() { return this.totalRow.locator('td').nth(1); }

  async navigateToAccountsOverview(): Promise<void> {
    await this.navigate(Constants.PATHS.ACCOUNTS_OVERVIEW);
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async getPageTitleText(): Promise<string> {
    await this.pageTitle.waitFor({ state: 'visible' });
    return (await this.pageTitle.textContent()) || '';
  }

  async getAccountCount(): Promise<number> {
    await this.accountRows.first().waitFor({ state: 'visible' });
    return this.accountRows.count();
  }

  async getAccountBalance(accountNumber: string): Promise<string> {
    const row = this.page.locator('#accountTable tbody tr', {
      has: this.page.locator('a', { hasText: accountNumber }),
    });
    await row.waitFor({ state: 'visible' });
    const balanceCell = row.locator('td:nth-child(2)');
    return ((await balanceCell.textContent()) || '').trim();
  }

  async getTotalBalance(): Promise<string> {
    await this.totalRow.waitFor({ state: 'visible', timeout: 10_000 });
    const text = await this.totalRow.textContent();
    return (text || '').replace('Total', '').trim();
  }

  accountLink(accountNumber: string) {
    return this.page.locator('#accountTable a', { hasText: accountNumber });
  }
}
