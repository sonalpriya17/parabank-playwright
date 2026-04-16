import { BasePage } from './BasePage';
import { Constants } from '../common/Constants';

export class HomePage extends BasePage {
  get navigationMenu() { return this.page.locator('#leftPanel li a'); }
  get logoutLink() { return this.page.locator('#leftPanel a[href*="logout"]'); }
  get rightPanelTitle() { return this.page.locator('#rightPanel h1.title').first(); }

  async navigateToHome(): Promise<void> {
    await this.navigate(Constants.PATHS.HOME);
  }

  async getNavigationLinks(): Promise<string[]> {
    await this.navigationMenu.first().waitFor({ state: 'visible' });
    const links = await this.navigationMenu.allTextContents();
    return links.map((link) => link.trim()).filter((link) => link.length > 0);
  }

  async clickNavigationLink(linkText: string): Promise<void> {
    await this.page
      .locator('#leftPanel li a', { hasText: linkText })
      .click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getRightPanelTitle(): Promise<string> {
    await this.rightPanelTitle.waitFor({ state: 'visible' });
    return (await this.rightPanelTitle.textContent()) || '';
  }

  async clickLogout(): Promise<void> {
    await this.logoutLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
