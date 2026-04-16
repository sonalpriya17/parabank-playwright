import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { Constants } from './Constants';

const { Given } = createBdd(test);

Given('the ParaBank application is open', async ({ page }) => {
  await page.goto(Constants.PATHS.HOME, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page).toHaveTitle(/ParaBank/);
});
