import { APIRequestContext } from '@playwright/test';
import { Constants } from '../common/Constants';
import { TransactionResponse } from '../data/types/response/TransactionResponse';
import { ApiLogger } from '../utils/ApiLogger';

export class TransactionClient {
  constructor(private request: APIRequestContext) {}

  async findByAmount(
    accountId: string,
    amount: string
  ): Promise<TransactionResponse[]> {
    const url = `${Constants.API_BASE_URL}/accounts/${accountId}/transactions/amount/${amount}`;
    const response = await this.request.get(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    await ApiLogger.log('GET', url, null, response);

    if (!response.ok()) {
      throw new Error(
        `API call failed with status ${response.status()}: ${await response.text()}`
      );
    }

    return (await response.json()) as TransactionResponse[];
  }

  async findAll(accountId: string): Promise<TransactionResponse[]> {
    const url = `${Constants.API_BASE_URL}/accounts/${accountId}/transactions`;
    const response = await this.request.get(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    await ApiLogger.log('GET', url, null, response);

    if (!response.ok()) {
      throw new Error(
        `API call failed with status ${response.status()}: ${await response.text()}`
      );
    }

    return (await response.json()) as TransactionResponse[];
  }

  async findById(transactionId: number): Promise<TransactionResponse> {
    const url = `${Constants.API_BASE_URL}/transactions/${transactionId}`;
    const response = await this.request.get(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    await ApiLogger.log('GET', url, null, response);

    if (!response.ok()) {
      throw new Error(
        `API call failed with status ${response.status()}: ${await response.text()}`
      );
    }

    return (await response.json()) as TransactionResponse;
  }
}
