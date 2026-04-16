import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';
import { BillPayeeData } from '../data/types';
import { DataTableParser } from '../utils/DataTableParser';
import { ResponseMessages } from '../common/ResponseMessages';

const { When, Then } = createBdd(test);

When(
  'the user pays a bill with the following details',
  async ({ billPayPage, session }, dataTable: DataTable) => {
    expect(session.accountNumber).toBeDefined();

    const data = DataTableParser.parseKeyValuePairs(dataTable.hashes(), session);
    const payee = data as unknown as BillPayeeData;

    session.lastPaymentAmount = payee.amount;
    console.log(`[BillPay] Paying $${payee.amount} to ${payee.name}`);

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
  console.log(`[BillPay] Payment amount captured: $${session.lastPaymentAmount}`);
});
