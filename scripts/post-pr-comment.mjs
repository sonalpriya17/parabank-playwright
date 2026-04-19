#!/usr/bin/env node
// Creates or updates the bot comment on the PR with run results.
// Finds an existing comment by the "🎭 Playwright Test Results" marker
// and PATCHes it; otherwise POSTs a new one.

import { execFileSync } from 'node:child_process';

const env = process.env;
const required = ['REPO', 'PR_NUMBER', 'GH_TOKEN'];
for (const k of required) {
  if (!env[k]) {
    console.error(`Missing required env: ${k}`);
    process.exit(1);
  }
}

const outcome = env.OUTCOME ?? 'success';
const statusIcon = outcome === 'success' ? '✅' : '❌';
const statusText = outcome === 'success' ? 'All tests passed' : 'Some tests failed';
const runUrl = env.RUN_URL ?? '';
const reportUrl = env.REPORT_URL ?? '';

const body = [
  '## 🎭 Playwright Test Results',
  '',
  `${statusIcon} **${statusText}**`,
  '',
  '| Metric | Count |',
  '|--------|-------|',
  `| Total  | ${env.TOTAL ?? 0} |`,
  `| ✅ Passed | ${env.PASSED ?? 0} |`,
  `| ❌ Failed | ${env.FAILED ?? 0} |`,
  `| 🔄 Flaky (passed on retry) | ${env.FLAKY ?? 0} |`,
  '',
  `**Retry Summary:** ${env.FLAKY_SUMMARY ?? ''}`,
  '',
  `**Commit:** \`${env.COMMIT ?? ''}\`  ·  **Run:** [#${env.RUN_NUMBER ?? ''}](${runUrl})  ·  **📊 [HTML report for this run](${runUrl}#artifacts)** (download the \`playwright-report\` artifact)`,
  '',
  '<details>',
  '<summary>Known flaky causes we tag</summary>',
  '',
  'When a test is flaky, we try to attribute it to one of these known root causes:',
  '',
  "- ☁ **Cloudflare interstitial** — ParaBank's CF bot-challenge page blocked registration",
  "- ⏱ **Other registration timeout** — Register response didn't render welcome or error in time (not CF-related)",
  "- 🔁 **ParaBank double-collision** — 'username already exists' returned twice for unique UUIDs (server false-positive)",
  '- ❓ **Unknown** — None of the above tags fired; download artifact and inspect `trace.zip` for root cause',
  '',
  `This run: ☁ ${env.CF_HITS ?? 0}  ·  ⏱ ${env.OTHER_TIMEOUT_HITS ?? 0}  ·  🔁 ${env.DOUBLE_COLLISION_HITS ?? 0}`,
  '</details>',
  '',
  `_Note: the [GitHub Pages URL](${reportUrl}) shows the **last main-branch run only** — it does **not** reflect this PR. For this PR's actual results, use the artifact link above._`,
].join('\n');

const marker = '🎭 Playwright Test Results';
const existing = gh([
  'api',
  `repos/${env.REPO}/issues/${env.PR_NUMBER}/comments`,
  '--jq', `.[] | select(.user.login == "github-actions[bot]") | select(.body | contains("${marker}")) | .id`,
]).trim().split('\n').filter(Boolean)[0];

if (existing) {
  gh(['api', '-X', 'PATCH', `repos/${env.REPO}/issues/comments/${existing}`, '-f', `body=${body}`]);
  console.log(`Updated existing comment ${existing}`);
} else {
  gh(['api', `repos/${env.REPO}/issues/${env.PR_NUMBER}/comments`, '-f', `body=${body}`]);
  console.log('Created new comment');
}

function gh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    env: { ...process.env, GH_TOKEN: env.GH_TOKEN },
  });
}
