import { APIResponse } from '@playwright/test';

const DEBUG = !!process.env.DEBUG;

export class ApiLogger {
  static async log(
    method: string,
    url: string,
    requestBody: unknown,
    response: APIResponse
  ): Promise<void> {
    if (!DEBUG && response.ok()) return;

    console.log(`\n--- ${method} ${url} ---`);

    if (requestBody) {
      console.log(`Body: ${JSON.stringify(requestBody, null, 2)}`);
    }

    console.log(`Status: ${response.status()}`);

    try {
      const body = await response.json();
      console.log(JSON.stringify(body, null, 2));
    } catch {
      const text = await response.text();
      console.log(text);
    }
  }
}
