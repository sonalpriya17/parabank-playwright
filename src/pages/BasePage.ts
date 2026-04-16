import { Page } from '@playwright/test';
import { Constants } from '../common/Constants';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(`${Constants.BASE_URL}${path}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getTextContent(selector: string): Promise<string> {
    const element = this.page.locator(selector).first();
    return (await element.textContent()) || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.locator(selector).first().isVisible();
  }
}
