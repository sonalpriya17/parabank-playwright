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

function attributeCause(tc) {
  if (tc.cf_hits > 0) return `${tc.cf_hits} Cloudflare interstitial(s) detected`;
  if (tc.double_collision_hits > 0) return `${tc.double_collision_hits} ParaBank false-positive 'username exists' (server bug)`;
  if (tc.other_timeout_hits > 0) return `${tc.other_timeout_hits} non-CF registration timeout(s)`;
  return null;
}

let flakySummary;
if (failed === 0 && flaky === 0) {
  flakySummary = 'No tests required retries. All tests passed on first attempt.';
} else {
  const cause = attributeCause(tagCounts);
  const parts = [];
  if (failed > 0) {
    parts.push(`${failed} test(s) failed hard (retries exhausted)`);
  }
  if (flaky > 0) {
    parts.push(`${flaky} flaky (passed on retry)`);
  }
  const head = parts.join(', ');
  flakySummary = cause
    ? `${head} — ${cause}`
    : `${head} — no known cause tagged; check trace.zip`;
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
