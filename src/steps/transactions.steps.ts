import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';

const { When, Then } = createBdd(test);

When(
  'the user searches transactions by amount using the API',
  async ({ transactionClient, session }) => {
    expect(session.accountNumber).toBeDefined();
    expect(session.lastPaymentAmount).toBeDefined();

    console.log(
      `[API] Searching transactions for account ${session.accountNumber} with amount $${session.lastPaymentAmount}`
    );

    const transactions = await transactionClient.findByAmount(
      session.accountNumber!,
      session.lastPaymentAmount!
    );

    session.capturedTransactions = transactions;
    console.log(`[API] Found ${transactions.length} transaction(s)`);
  }
);

Then('the API response should contain the bill payment transaction', async ({ session }) => {
  expect(session.capturedTransactions).toBeDefined();
  expect(session.capturedTransactions!.length).toBeGreaterThan(0);

  console.log(
    `[API] Transaction IDs: ${session.capturedTransactions!.map((t) => t.id).join(', ')}`
  );
});

Then('the transaction details should match the payment data', async ({ session }) => {
  expect(session.capturedTransactions).toBeDefined();
  expect(session.capturedTransactions!.length).toBeGreaterThan(0);

  const transaction = session.capturedTransactions![0];
  const expectedAmount = parseFloat(session.lastPaymentAmount!);

  expect(transaction.amount).toBe(expectedAmount);
  expect(transaction.accountId).toBe(parseInt(session.accountNumber!, 10));
  expect(transaction.type).toBeTruthy();
  expect(transaction.description).toBeTruthy();
  expect(transaction.date).toBeTruthy();

  console.log(`[API] Transaction verified:`);
  console.log(`  ID: ${transaction.id}`);
  console.log(`  Amount: $${transaction.amount}`);
  console.log(`  Type: ${transaction.type}`);
  console.log(`  Description: ${transaction.description}`);
  console.log(`  Date: ${transaction.date}`);
});
