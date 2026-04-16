import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { ResponseMessages } from '../common/ResponseMessages';

const { When, Then } = createBdd(test);

When('the user logs out', async ({ homePage }) => {
  await homePage.clickLogout();
});

When('the user logs in with the registered credentials', async ({ loginPage, session }) => {
  expect(session.user).toBeDefined();
  await loginPage.navigateToLogin();
  await loginPage.login(session.user!.username, session.user!.password);
});

Then('the user should see the Accounts Overview page', async ({ loginPage }) => {
  const isSuccess = await loginPage.isLoginSuccessful();
  expect(isSuccess).toBeTruthy();

  const heading = await loginPage.getPageHeading();
  expect(heading).toContain(ResponseMessages.LOGIN.WELCOME);
});
