import { APIResponse } from '@playwright/test';

export class ApiLogger {
  static async log(
    method: string,
    url: string,
    requestBody: unknown,
    response: APIResponse
  ): Promise<void> {
    console.log('\n--- REQUEST ---');
    console.log(`curl -X ${method} '${url}'`);

    if (requestBody) {
      console.log(`Body: ${JSON.stringify(requestBody, null, 2)}`);
    }

    console.log('\n--- RESPONSE ---');
    console.log(`Status: ${response.status()}`);

    try {
      const body = await response.json();
      console.log(JSON.stringify(body, null, 2));
    } catch {
      const text = await response.text();
      console.log(text);
    }

    console.log('--- END ---\n');
  }
}
