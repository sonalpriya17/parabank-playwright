import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';

const { After } = createBdd(test);

After(async ({ page, $testInfo }) => {
  if ($testInfo.status === 'failed') {
    console.log(`\n[Failed] ${$testInfo.title}`);
    console.log(`[URL at failure] ${page.url()}`);
    console.log(`[Duration] ${$testInfo.duration}ms`);
  }
});
