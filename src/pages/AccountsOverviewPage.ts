import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class AccountsOverviewPage extends BasePage {
  private readonly pageTitle = () =>
    this.page.getByRole('heading', { name: 'Accounts Overview' });
  private readonly accountsTable = () =>
    this.page.locator('#accountTable');
  private readonly accountRows = () =>
    this.page.locator('#accountTable tbody tr');
  private readonly totalRow = () =>
    this.page.locator('#accountTable tr', { hasText: 'Total' });
  private readonly totalBalance = () =>
    this.totalRow().locator('td').nth(1);

  async navigateToAccountsOverview(): Promise<void> {
    await this.navigate(Constants.PATHS.ACCOUNTS_OVERVIEW);
    await this.pageTitle().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async getPageTitle(): Promise<string> {
    await this.pageTitle().waitFor({ state: 'visible' });
    return (await this.pageTitle().textContent()) || '';
  }

  async isAccountsTableVisible(): Promise<boolean> {
    return this.accountsTable().isVisible();
  }

  async getAccountCount(): Promise<number> {
    await this.accountRows().first().waitFor({ state: 'visible' });
    return this.accountRows().count();
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
    await this.totalRow().waitFor({ state: 'visible', timeout: 10_000 });
    const text = await this.totalRow().textContent();
    return (text || '').replace('Total', '').trim();
  }

  async isAccountPresent(accountNumber: string): Promise<boolean> {
    const link = this.page.locator('#accountTable a', {
      hasText: accountNumber,
    });
    return link.isVisible();
  }
}
