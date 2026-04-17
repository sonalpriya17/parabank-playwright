import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';
import { DataTableParser } from '../utils/DataTableParser';
import { ResponseMessages } from '../common/ResponseMessages';
import { TestLogger } from '../utils/TestLogger';

const { When, Then } = createBdd(test);

When(
  'the user pays a bill with the following details',
  async ({ billPayPage, session }, dataTable: DataTable) => {
    expect(session.accountNumber).toBeDefined();

    const payee = DataTableParser.parseBillPayData(dataTable.hashes(), session);

    session.lastPaymentAmount = payee.amount;
    TestLogger.log('BillPay', `Paying $${payee.amount} to ${payee.name}`);

    await billPayPage.navigateToBillPay();
    await billPayPage.payBill(payee, session.accountNumber!);
  }
);

Then('the bill payment should be completed successfully', async ({ billPayPage }) => {
  await expect(billPayPage.successHeading).toBeVisible({ timeout: 10_000 });
  await expect(billPayPage.successHeading).toContainText(ResponseMessages.BILL_PAY.SUCCESS);
});

Then('the payment amount should be captured for API verification', async ({ session }) => {
  expect(session.lastPaymentAmount).toBeDefined();
  TestLogger.log('BillPay', `Payment amount captured: $${session.lastPaymentAmount}`);
});
