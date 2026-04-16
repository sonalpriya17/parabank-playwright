import { expect } from '@playwright/test';
import { createBdd, DataTable } from 'playwright-bdd';
import { test } from '../fixtures';
import { BillPayeeData } from '../data/types';
import { ResponseMessages } from '../common/ResponseMessages';

const { When, Then } = createBdd(test);

When(
  'the user pays a bill with the following details',
  async ({ billPayPage, session }, dataTable: DataTable) => {
    expect(session.accountNumber).toBeDefined();

    const rows = dataTable.hashes();
    const data: Record<string, string> = {};
    for (const row of rows) {
      data[row.PARAM] = row.VALUE;
    }

    const payee: BillPayeeData = {
      name: data['name'],
      address: data['address'],
      city: data['city'],
      state: data['state'],
      zipCode: data['zipCode'],
      phone: data['phone'],
      accountNumber: data['accountNumber'],
      verifyAccountNumber: data['verifyAccountNumber'],
      amount: data['amount'],
    };

    session.lastPaymentAmount = payee.amount;
    console.log(`[BillPay] Paying $${payee.amount} to ${payee.name}`);

    await billPayPage.navigateToBillPay();
    await billPayPage.payBill(payee, session.accountNumber!);
  }
);

Then('the bill payment should be completed successfully', async ({ billPayPage }) => {
  const isSuccess = await billPayPage.isPaymentSuccessful();
  expect(isSuccess).toBeTruthy();

  const message = await billPayPage.getSuccessMessage();
  expect(message).toContain(ResponseMessages.BILL_PAY.SUCCESS);
});

Then('the payment amount should be captured for API verification', async ({ session }) => {
  expect(session.lastPaymentAmount).toBeDefined();
  console.log(`[BillPay] Payment amount captured: $${session.lastPaymentAmount}`);
});
