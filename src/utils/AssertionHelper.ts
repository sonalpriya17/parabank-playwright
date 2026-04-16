import { expect, Page } from '@playwright/test';

export class AssertionHelper {
  static async expectTextVisible(page: Page, text: string): Promise<void> {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }

  static async expectUrlContains(page: Page, path: string): Promise<void> {
    await expect(page).toHaveURL(new RegExp(path));
  }

  static async expectElementVisible(
    page: Page,
    selector: string
  ): Promise<void> {
    await expect(page.locator(selector).first()).toBeVisible();
  }

  static async expectElementCount(
    page: Page,
    selector: string,
    count: number
  ): Promise<void> {
    await expect(page.locator(selector)).toHaveCount(count);
  }
}
