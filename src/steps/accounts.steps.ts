import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { ResponseMessages } from '../common/ResponseMessages';
import { TestLogger } from '../utils/TestLogger';

const { When, Then } = createBdd(test);

When('the user opens a new Savings account', async ({ openAccountPage }) => {
  await openAccountPage.navigateToOpenAccount();
});

Then('the new account should be created successfully', async ({ openAccountPage, session }) => {
  const accountNumber = await openAccountPage.openSavingsAccount();
  expect(accountNumber).toBeTruthy();
  session.accountNumber = accountNumber.trim();

  await expect(openAccountPage.successHeading).toBeVisible({ timeout: 10_000 });
  TestLogger.log('Account', `Created successfully: ${session.accountNumber}`);
});

Then('the account number should be captured', async ({ session }) => {
  expect(session.accountNumber).toBeDefined();
  expect(session.accountNumber).toBeTruthy();
  TestLogger.log('Account', `Captured account number: ${session.accountNumber}`);
});

When('the user navigates to the Accounts Overview page', async ({ accountsOverviewPage }) => {
  await accountsOverviewPage.navigateToAccountsOverview();
});

Then('the accounts overview should display balance details', async ({ accountsOverviewPage }) => {
  await expect(accountsOverviewPage.pageTitle).toContainText(ResponseMessages.LOGIN.WELCOME);
  await expect(accountsOverviewPage.accountsTable).toBeVisible();

  const totalBalance = await accountsOverviewPage.getTotalBalance();
  expect(totalBalance).toBeTruthy();
  TestLogger.log('Accounts', `Total balance: ${totalBalance}`);
});

Then('the new savings account should be listed', async ({ accountsOverviewPage, session }) => {
  expect(session.accountNumber).toBeDefined();
  await expect(accountsOverviewPage.accountLink(session.accountNumber!)).toBeVisible();
});
