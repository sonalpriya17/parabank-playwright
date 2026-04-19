import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';
import { DataTableParser } from '../utils/DataTableParser';
import { ResponseMessages } from '../common/ResponseMessages';
import { TestLogger } from '../utils/TestLogger';

const { Given, When, Then } = createBdd(test);

Given('the user navigates to the registration page', async ({ registerPage }) => {
  await registerPage.navigateToRegister();
});

When(
  'the user registers with the following details',
  async ({ registerPage, session }, dataTable: DataTable) => {
    const proposed = DataTableParser.parseUserData(dataTable.hashes(), session);
    TestLogger.log('Registration', `Proposed username: ${proposed.username}`);
    const registered = await registerPage.register(proposed);
    session.user = registered;
    TestLogger.log('Registration', `Registered username: ${registered.username}`);
  }
);

Then('the registration confirmation is displayed', async ({ registerPage }) => {
  await expect(registerPage.welcomeMessage).toBeVisible({ timeout: 10_000 });
  await expect(registerPage.welcomeMessage).toContainText(ResponseMessages.REGISTRATION.SUCCESS_TITLE);
});
