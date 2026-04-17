import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { TransactionResponse } from '../data/types/response/TransactionResponse';
import { TestLogger } from '../utils/TestLogger';

const { When, Then } = createBdd(test);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

When(
  'the user searches transactions for the account using the API',
  async ({ transactionClient, session }) => {
    expect(session.accountNumber).toBeDefined();
    expect(session.lastPaymentAmount).toBeDefined();

    const accountId = session.accountNumber!;
    const amount = session.lastPaymentAmount!;
    TestLogger.log('API', `Searching transactions by amount $${amount} for account ${accountId}`);

    // Retry with delay — ParaBank may need time to persist transactions
    let transactions: TransactionResponse[] = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      await sleep(1000);
      transactions = await transactionClient.findByAmount(accountId, amount);
      if (transactions.length > 0) break;
      TestLogger.log('API', `Attempt ${attempt}: no transactions yet, retrying...`);
    }

    session.capturedTransactions = transactions;
    TestLogger.log('API', `Found ${transactions.length} transaction(s) matching amount $${amount}`);
  }
);

Then('the API response should contain account transactions', async ({ session }) => {
  expect(session.capturedTransactions).toBeDefined();
  expect(session.capturedTransactions!.length).toBeGreaterThan(0);

  TestLogger.log('API', `Transaction IDs: ${session.capturedTransactions!.map((t) => t.id).join(', ')}`);
});

Then('the transaction details should be valid', async ({ session }) => {
  expect(session.capturedTransactions).toBeDefined();
  expect(session.capturedTransactions!.length).toBeGreaterThan(0);

  const transaction = session.capturedTransactions![0];

  expect(transaction.accountId).toBe(parseInt(session.accountNumber!, 10));
  expect(transaction.amount).toBeGreaterThan(0);
  expect(transaction.type).toBeTruthy();
  expect(transaction.description).toBeTruthy();
  expect(transaction.date).toBeTruthy();

  TestLogger.log('API', `Transaction verified: ID=${transaction.id}, Amount=$${transaction.amount}, Type=${transaction.type}, Description=${transaction.description}`);
});
