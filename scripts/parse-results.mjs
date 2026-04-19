#!/usr/bin/env node
// Reads Playwright's JSON reporter output and emits a flat summary to
// $GITHUB_OUTPUT (plus stdout as JSON when run locally). Replaces the
// stdout grep/awk block previously inlined in the workflow.

import { readFileSync, appendFileSync } from 'node:fs';

const RESULTS_PATH = process.argv[2] ?? 'playwright-report/results.json';

const TAGS = {
  cf_hits: /\[CLOUDFLARE\]/g,
  other_timeout_hits: /\[REGISTER-TIMEOUT\]/g,
  double_collision_hits: /\[COLLISION-DOUBLE\]/g,
};

function walkSpecs(node, out = []) {
  if (!node) return out;
  for (const spec of node.specs ?? []) out.push(spec);
  for (const child of node.suites ?? []) walkSpecs(child, out);
  return out;
}

function collectStdouts(results) {
  let blob = '';
  for (const r of results ?? []) {
    for (const s of r.stdout ?? []) blob += s.text ?? s.buffer ?? '';
    for (const s of r.stderr ?? []) blob += s.text ?? s.buffer ?? '';
  }
  return blob;
}

const report = JSON.parse(readFileSync(RESULTS_PATH, 'utf8'));

const stats = report.stats ?? {};
const passed = stats.expected ?? 0;
const failed = stats.unexpected ?? 0;
const flaky = stats.flaky ?? 0;
const skipped = stats.skipped ?? 0;
const total = passed + failed + flaky + skipped;
const durationSec = Math.round((stats.duration ?? 0) / 1000);

const allSpecs = (report.suites ?? []).flatMap((s) => walkSpecs(s));
const failedTitles = [];
let stdoutBlob = '';

for (const spec of allSpecs) {
  for (const t of spec.tests ?? []) {
    stdoutBlob += collectStdouts(t.results);
    if (t.status === 'unexpected') failedTitles.push(spec.title);
  }
}

const tagCounts = Object.fromEntries(
  Object.entries(TAGS).map(([k, re]) => [k, (stdoutBlob.match(re) ?? []).length]),
);

let flakySummary;
if (flaky === 0) {
  flakySummary = 'No tests required retries. All tests passed on first attempt.';
} else if (tagCounts.cf_hits > 0) {
  flakySummary = `${flaky} flaky test(s) — ${tagCounts.cf_hits} Cloudflare interstitial(s) detected (likely cause)`;
} else if (tagCounts.double_collision_hits > 0) {
  flakySummary = `${flaky} flaky test(s) — ${tagCounts.double_collision_hits} ParaBank false-positive 'username exists' (both original AND regenerated username rejected; likely server bug)`;
} else if (tagCounts.other_timeout_hits > 0) {
  flakySummary = `${flaky} flaky test(s) — ${tagCounts.other_timeout_hits} non-CF registration timeout(s) detected`;
} else {
  flakySummary = `${flaky} flaky test(s) — no known cause tagged in log; check trace.zip for root cause`;
}

const outputs = {
  total,
  passed,
  failed,
  flaky,
  skipped,
  duration_sec: durationSec,
  cf_hits: tagCounts.cf_hits,
  other_timeout_hits: tagCounts.other_timeout_hits,
  double_collision_hits: tagCounts.double_collision_hits,
  flaky_summary: flakySummary,
  failed_tests: failedTitles.slice(0, 10).join('\n'),
};

const ghOutput = process.env.GITHUB_OUTPUT;
if (ghOutput) {
  const lines = [];
  for (const [k, v] of Object.entries(outputs)) {
    const str = String(v);
    if (str.includes('\n')) {
      lines.push(`${k}<<EOF`, str, 'EOF');
    } else {
      lines.push(`${k}=${str}`);
    }
  }
  appendFileSync(ghOutput, lines.join('\n') + '\n');
}

console.log(JSON.stringify(outputs, null, 2));
