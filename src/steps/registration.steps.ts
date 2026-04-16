import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';
import { DataTableParser } from '../utils/DataTableParser';
import { ResponseMessages } from '../common/ResponseMessages';

const { Given, When, Then } = createBdd(test);

Given('the user navigates to the registration page', async ({ registerPage }) => {
  await registerPage.navigateToRegister();
});

When(
  'the user registers with the following details',
  async ({ registerPage, session }, dataTable: DataTable) => {
    const user = DataTableParser.parseUserData(dataTable.hashes(), session);
    session.user = user;
    console.log(`[Registration] Username: ${user.username}`);
    await registerPage.register(user);
  }
);

Then('the registration confirmation is displayed', async ({ registerPage }) => {
  await expect(registerPage.welcomeMessage).toBeVisible({ timeout: 10_000 });
  await expect(registerPage.welcomeMessage).toContainText(ResponseMessages.REGISTRATION.SUCCESS_TITLE);
});
