import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { ResponseMessages } from '../common/ResponseMessages';

const { When, Then } = createBdd(test);

When('the user opens a new Savings account', async ({ openAccountPage }) => {
  await openAccountPage.navigateToOpenAccount();
});

Then('the new account should be created successfully', async ({ openAccountPage, session }) => {
  const accountNumber = await openAccountPage.openSavingsAccount();
  expect(accountNumber).toBeTruthy();
  session.accountNumber = accountNumber.trim();

  const isCreated = await openAccountPage.isAccountCreated();
  expect(isCreated).toBeTruthy();
  console.log(`[Account] Created successfully: ${session.accountNumber}`);
});

Then('the account number should be captured', async ({ session }) => {
  expect(session.accountNumber).toBeDefined();
  expect(session.accountNumber).toBeTruthy();
  console.log(`[Account] Captured account number: ${session.accountNumber}`);
});

When('the user navigates to the Accounts Overview page', async ({ accountsOverviewPage }) => {
  await accountsOverviewPage.navigateToAccountsOverview();
});

Then('the accounts overview should display balance details', async ({ accountsOverviewPage }) => {
  const title = await accountsOverviewPage.getPageTitle();
  expect(title).toContain(ResponseMessages.LOGIN.WELCOME);

  const isTableVisible = await accountsOverviewPage.isAccountsTableVisible();
  expect(isTableVisible).toBeTruthy();

  const totalBalance = await accountsOverviewPage.getTotalBalance();
  expect(totalBalance).toBeTruthy();
  console.log(`[Accounts] Total balance: ${totalBalance}`);
});

Then('the new savings account should be listed', async ({ accountsOverviewPage, session }) => {
  expect(session.accountNumber).toBeDefined();
  const isPresent = await accountsOverviewPage.isAccountPresent(session.accountNumber!);
  expect(isPresent).toBeTruthy();
});
