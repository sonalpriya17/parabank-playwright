import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';
import { UserFactory } from '../data/factories/UserFactory';
import { ResponseMessages } from '../common/ResponseMessages';

const { Given, When, Then } = createBdd(test);

Given('the user navigates to the registration page', async ({ registerPage }) => {
  await registerPage.navigateToRegister();
});

When(
  'the user registers with the following details',
  async ({ registerPage, session }, dataTable: DataTable) => {
    const rows = dataTable.hashes();
    const user = UserFactory.create(session.sessionKey);

    for (const row of rows) {
      if (row.VALUE !== '<generated>' && !row.VALUE.includes('<sessionKey>')) {
        const key = row.PARAM as keyof typeof user;
        if (key in user) {
          (user as unknown as Record<string, string>)[key] = row.VALUE;
        }
      }
    }

    session.user = user;
    console.log(`[Registration] Username: ${user.username}`);
    await registerPage.register(user);
  }
);

Then('the registration confirmation is displayed', async ({ registerPage }) => {
  const isSuccess = await registerPage.isRegistrationSuccessful();
  expect(isSuccess).toBeTruthy();

  const title = await registerPage.getWelcomeTitle();
  expect(title).toContain(ResponseMessages.REGISTRATION.SUCCESS_TITLE);
});
