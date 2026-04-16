import { test } from '../fixtures';

test.beforeEach(async ({ page }) => {
  console.log(`\n[Test Start] ${new Date().toISOString()}`);
  console.log(`[URL] ${page.url()}`);
});

test.afterEach(async ({ page }, testInfo) => {
  console.log(`\n[Test End] ${testInfo.title} - ${testInfo.status}`);
  console.log(`[Duration] ${testInfo.duration}ms`);

  if (testInfo.status === 'failed') {
    console.log(`[Failed] ${testInfo.title}`);
    console.log(`[URL at failure] ${page.url()}`);
  }
});
