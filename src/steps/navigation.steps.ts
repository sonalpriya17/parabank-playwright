import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';

const { Then } = createBdd(test);

Then(
  'the global navigation menu should contain the following links',
  async ({ homePage }, dataTable: DataTable) => {
    const expectedLinks = dataTable.hashes().map((row) => row.linkText);
    const actualLinks = await homePage.getNavigationLinks();

    for (const expected of expectedLinks) {
      const found = actualLinks.some((link) =>
        link.toLowerCase().includes(expected.toLowerCase())
      );
      expect(found).toBeTruthy();
    }
  }
);

Then('each navigation link should navigate to the correct page', async ({ homePage, page }) => {
  const linkPageMap: Record<string, string> = {
    'Open New Account': 'openaccount',
    'Accounts Overview': 'overview',
    'Transfer Funds': 'transfer',
    'Bill Pay': 'billpay',
    'Find Transactions': 'findtrans',
    'Update Contact Info': 'updateprofile',
    'Request Loan': 'requestloan',
  };

  for (const [linkText, urlPart] of Object.entries(linkPageMap)) {
    await homePage.clickNavigationLink(linkText);
    await page.waitForLoadState('domcontentloaded');
    const url = page.url();
    expect(url).toContain(urlPart);
  }
});
