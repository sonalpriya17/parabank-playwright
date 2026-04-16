import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { ResponseMessages } from '../common/ResponseMessages';

const { When, Then } = createBdd(test);

When(
  'the user transfers {string} dollars from the savings account to another account',
  async ({ transferFundsPage, session }, amount: string) => {
    expect(session.accountNumber).toBeDefined();
    await transferFundsPage.navigateToTransferFunds();

    const toOptions = await transferFundsPage.getToAccountOptions();
    console.log(`[Transfer] Available to-accounts: ${JSON.stringify(toOptions)}`);
    console.log(`[Transfer] From account (savings): ${session.accountNumber}`);

    const toAccount = toOptions
      .map((opt) => opt.trim())
      .find((opt) => opt !== session.accountNumber && opt.length > 0);

    expect(toAccount).toBeDefined();
    console.log(`[Transfer] Transferring $${amount} from ${session.accountNumber} to ${toAccount}`);

    await transferFundsPage.transferFunds(
      amount,
      session.accountNumber!,
      toAccount!
    );
  }
);

Then('the transfer should be completed successfully', async ({ transferFundsPage }) => {
  await expect(transferFundsPage.successHeading).toBeVisible({ timeout: 10_000 });
  await expect(transferFundsPage.successHeading).toContainText(ResponseMessages.TRANSFER.SUCCESS);
});
