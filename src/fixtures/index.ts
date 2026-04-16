import { test as base } from 'playwright-bdd';
import { v4 as uuidv4 } from 'uuid';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { BillPayPage } from '../pages/BillPayPage';
import { TransactionClient } from '../client/TransactionClient';
import { SessionData } from '../data/types';

type Fixtures = {
  registerPage: RegisterPage;
  loginPage: LoginPage;
  homePage: HomePage;
  openAccountPage: OpenAccountPage;
  accountsOverviewPage: AccountsOverviewPage;
  transferFundsPage: TransferFundsPage;
  billPayPage: BillPayPage;
  transactionClient: TransactionClient;
  session: SessionData;
};

export const test = base.extend<Fixtures>({
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  openAccountPage: async ({ page }, use) => {
    await use(new OpenAccountPage(page));
  },

  accountsOverviewPage: async ({ page }, use) => {
    await use(new AccountsOverviewPage(page));
  },

  transferFundsPage: async ({ page }, use) => {
    await use(new TransferFundsPage(page));
  },

  billPayPage: async ({ page }, use) => {
    await use(new BillPayPage(page));
  },

  transactionClient: async ({ request }, use) => {
    await use(new TransactionClient(request));
  },

  session: async ({}, use) => {
    const session: SessionData = {
      sessionKey: uuidv4(),
    };
    await use(session);
  },
});
