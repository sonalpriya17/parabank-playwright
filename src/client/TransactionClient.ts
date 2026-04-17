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
    return this.get<TransactionResponse[]>(
      `/accounts/${accountId}/transactions/amount/${amount}`
    );
  }

  async findAll(accountId: string): Promise<TransactionResponse[]> {
    return this.get<TransactionResponse[]>(
      `/accounts/${accountId}/transactions`
    );
  }

  async findById(transactionId: number): Promise<TransactionResponse> {
    return this.get<TransactionResponse>(
      `/transactions/${transactionId}`
    );
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${Constants.API_BASE_URL}${path}`;
    const response = await this.request.get(url, {
      headers: { Accept: 'application/json' },
    });

    await ApiLogger.log('GET', url, null, response);

    if (!response.ok()) {
      throw new Error(
        `GET ${path} failed: ${response.status()} ${await response.text()}`
      );
    }

    return response.json() as Promise<T>;
  }
}
