import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }
}
