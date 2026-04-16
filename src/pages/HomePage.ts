import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class HomePage extends BasePage {
  private readonly navigationMenu = () =>
    this.page.locator('#leftPanel li a');
  private readonly logoutLink = () =>
    this.page.locator('#leftPanel a[href*="logout"]');
  private readonly rightPanelTitle = () =>
    this.page.locator('#rightPanel h1.title').first();

  async navigateToHome(): Promise<void> {
    await this.navigate(Constants.PATHS.HOME);
  }

  async getNavigationLinks(): Promise<string[]> {
    await this.navigationMenu().first().waitFor({ state: 'visible' });
    const links = await this.navigationMenu().allTextContents();
    return links.map((link) => link.trim()).filter((link) => link.length > 0);
  }

  async clickNavigationLink(linkText: string): Promise<void> {
    await this.page
      .locator('#leftPanel li a', { hasText: linkText })
      .click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isNavigationLinkVisible(linkText: string): Promise<boolean> {
    return this.page
      .locator('#leftPanel li a', { hasText: linkText })
      .isVisible();
  }

  async getRightPanelTitle(): Promise<string> {
    await this.rightPanelTitle().waitFor({ state: 'visible' });
    return (await this.rightPanelTitle().textContent()) || '';
  }

  async clickLogout(): Promise<void> {
    await this.logoutLink().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
