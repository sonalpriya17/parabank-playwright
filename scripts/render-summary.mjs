#!/usr/bin/env node
// Writes the GitHub Actions job summary. Called once per run.

import { appendFileSync } from 'node:fs';

const env = process.env;
const out = env.GITHUB_STEP_SUMMARY;
if (!out) {
  console.error('GITHUB_STEP_SUMMARY not set; nothing to write');
  process.exit(0);
}

const outcome = env.OUTCOME ?? 'success';
const statusLine = outcome === 'success'
  ? '✅ **All tests passed**'
  : '❌ **Some tests failed**';

const lines = [
  '## 🎭 Playwright E2E Test Results',
  '',
  statusLine,
  '',
  '| Metric | Count |',
  '|--------|-------|',
  `| Total Tests | ${env.TOTAL ?? 0} |`,
  `| ✅ Passed | ${env.PASSED ?? 0} |`,
  `| ❌ Failed | ${env.FAILED ?? 0} |`,
  `| 🔄 Flaky (passed on retry) | ${env.FLAKY ?? 0} |`,
  '',
  '| Detail | Value |',
  '|--------|-------|',
  `| Branch | \`${env.BRANCH ?? ''}\` |`,
  `| Commit | \`${env.COMMIT ?? ''}\` |`,
  `| Triggered by | ${env.ACTOR ?? ''} |`,
  '',
  `**Retry Summary:** ${env.FLAKY_SUMMARY ?? ''}`,
  '',
  `📊 [View Full Report](${env.REPORT_URL ?? ''})`,
  '',
];

appendFileSync(out, lines.join('\n') + '\n');
