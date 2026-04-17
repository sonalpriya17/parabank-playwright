import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';
import { Constants } from '../common/Constants';

const { Then } = createBdd(test);

Then(
  'the global navigation menu should contain the following links',
  async ({ homePage }, dataTable: DataTable) => {
    const expectedLinks = dataTable.hashes().map((row) => row.linkText);
    const actualLinks = await homePage.getNavigationLinks();
    const lowerActual = actualLinks.map((l) => l.toLowerCase());

    for (const expected of expectedLinks) {
      expect(
        lowerActual.some((link) => link.includes(expected.toLowerCase()))
      ).toBe(true);
    }
  }
);

Then('each navigation link should navigate to the correct page', async ({ homePage, page }) => {
  for (const [linkText, urlPart] of Object.entries(Constants.NAVIGATION_LINKS)) {
    await homePage.clickNavigationLink(linkText);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain(urlPart);
  }
});
