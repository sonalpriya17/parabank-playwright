import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { Constants } from './Constants';
import { ResponseMessages } from './ResponseMessages';
import { UserFactory } from '../data/factories/UserFactory';
import { TestLogger } from '../utils/TestLogger';

const { Given } = createBdd(test);

Given('the ParaBank application is open', async ({ page }) => {
  await page.goto(Constants.PATHS.HOME, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page).toHaveTitle(/ParaBank/);
});

Given('a new user is registered', async ({ page, registerPage, session }) => {
  await page.goto(Constants.PATHS.HOME, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/ParaBank/);

  const proposed = UserFactory.create(session.sessionKey);
  TestLogger.log('Registration', `Proposed username: ${proposed.username}`);

  await registerPage.navigateToRegister();
  const registered = await registerPage.register(proposed);
  session.user = registered;
  TestLogger.log('Registration', `Registered username: ${registered.username}`);

  await expect(registerPage.welcomeMessage).toBeVisible({ timeout: 10_000 });
  await expect(registerPage.welcomeMessage).toContainText(ResponseMessages.REGISTRATION.SUCCESS_TITLE);
});
