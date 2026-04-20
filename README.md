# ParaBank Playwright

End-to-end test automation for [ParaBank](https://parabank.parasoft.com/parabank/index.htm) — a public banking demo app — built with [Playwright](https://playwright.dev/) and [playwright-bdd](https://github.com/vitalets/playwright-bdd) (Cucumber-style Gherkin on top of Playwright Test).

The suite covers the full customer journey: registration, login, account opening, transfers, bill pay, and transaction history.

---

## Quick start

```bash
npm install
npx playwright install --with-deps chromium
npm test
```

The `test` script generates BDD test files from `.feature` sources and then runs Playwright:

```bash
npm test                 # headless, full suite
npm run test:headed      # show the browser
npm run test:ui-mode     # Playwright's interactive UI runner
npm run test:debug       # step through with the inspector
npm run report           # open the last HTML report
npm run lint             # eslint
```

Override the target environment with env vars (a `.env` file is honored via `dotenv`):

| Var            | Default                                      | Purpose                          |
| -------------- | -------------------------------------------- | -------------------------------- |
| `BASE_URL`     | `https://parabank.parasoft.com`              | UI base URL                      |
| `API_BASE_URL` | `https://parabank.parasoft.com/parabank/services/bank` | REST base URL          |

---

## Project layout

```
.
├── features/                  # Gherkin .feature files, grouped by capability
│   ├── accounts/
│   ├── billpay/
│   ├── login/
│   ├── navigation/
│   ├── registration/
│   ├── transactions/
│   └── transfers/
├── src/
│   ├── client/                # REST API clients (TransactionClient)
│   ├── common/                # Cross-cutting steps + Constants + ResponseMessages
│   ├── data/
│   │   ├── factories/         # Synthetic data builders (UserFactory, ...)
│   │   └── types/             # UserData, SessionData, BillPayeeData, ...
│   ├── fixtures/              # Playwright test fixtures (page objects + session)
│   ├── hooks/                 # Before/After hooks
│   ├── pages/                 # Page Object Model — one class per ParaBank page
│   ├── steps/                 # Gherkin step bindings, one file per feature group
│   └── utils/                 # DataTableParser, TestLogger, ApiLogger
├── scripts/                   # CI helpers (results parsing, PR comments)
├── docs/
│   └── adr/                   # Architecture Decision Records
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

### Architectural layers

```
   ┌──────────────────────────┐
   │     features/*.feature   │  ← Gherkin: business intent
   └────────────┬─────────────┘
                │
   ┌────────────▼─────────────┐
   │     src/steps/*.steps    │  ← Step bindings (Given/When/Then)
   │     src/common/CommonSteps│
   └────────────┬─────────────┘
                │
   ┌────────────▼─────────────┐
   │     src/pages/*Page      │  ← Page Object Model (UI interactions)
   │     src/client/*Client   │  ← REST clients (API interactions)
   └────────────┬─────────────┘
                │
   ┌────────────▼─────────────┐
   │     src/data/factories   │  ← Synthetic test data
   │     src/data/types       │  ← Shared types
   │     src/common/Constants │  ← URLs, default password, paths
   └──────────────────────────┘
```

The dependency direction is strictly downward — pages never know about steps,
factories never know about pages.

---

## Writing a new test

### 1. Author the scenario

Add a `.feature` file under `features/<capability>/`. ParaBank scenarios use
two override sentinels in data tables:

- `<generated>` — let the factory fill the field
- `<sessionKey>`, `<accountNumber>`, `<defaultPassword>`, `<lastPaymentAmount>` — pull from the active session

```gherkin
Feature: Open new account
  Background:
    Given the ParaBank application is open
    And a new user is registered

  Scenario: Open a savings account from an existing checking account
    When the user opens a new SAVINGS account
    Then the new account number is displayed
```

### 2. Bind the steps

Add or extend a file in [src/steps/](src/steps/). Steps receive Playwright
fixtures (page objects, session, API client) by destructuring:

```ts
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
const { When, Then } = createBdd(test);

When('the user opens a new {word} account', async ({ openAccountPage }, kind) => {
  await openAccountPage.openAccount(kind);
});
```

### 3. Page object

Add or extend a class in [src/pages/](src/pages/) extending [BasePage](src/pages/BasePage.ts).
Locators are exposed as getters; actions are async methods. Never assert from a
page object — return data and assert in the step.

### 4. Test data

If the scenario needs synthetic data, reach for
[src/data/factories/](src/data/factories/). Add a new factory only if no
existing one fits — see [ADR 0001 — Test Architecture](docs/adr/0001-test-architecture.md)
for the conventions and rationale (factory layer is documented under "Conventions per layer").

---

## Test data: how it works

Most scenarios start with `Given a new user is registered`, which calls
`UserFactory.create(session.sessionKey)` and submits the result to ParaBank's
registration form. Per-row overrides from a Gherkin data table are merged on
top by [DataTableParser](src/utils/DataTableParser.ts):

```ts
return { ...UserFactory.create(session.sessionKey), ...overrides } as UserData;
```

ParaBank persists every registered user permanently and gives us no cleanup
endpoint, so test data must be unique on every run. The username format —
`u_<sessionPrefix>_<faker6><uuid8>` — combines a human-readable session prefix
(for log traceability) with ~2.4 × 10²⁰ random combinations (for actual
collision resistance). The full rationale — including alternatives we
rejected — lives in [ADR 0001 — Test Architecture](docs/adr/0001-test-architecture.md)
under "Resilience patterns".

---

## CI

GitHub Actions workflow lives at
[.github/workflows/playwright.yml](.github/workflows/playwright.yml). Helper
scripts in [scripts/](scripts/) parse Playwright results, render summaries,
and post PR comments.

Reasonable defaults baked into [playwright.config.ts](playwright.config.ts):

- `retries: 3` — ParaBank is a shared public instance; transient flakes are
  expected.
- `workers: 2` in CI, `3` locally — bounded so the shared instance does not
  rate-limit us.
- `screenshot: 'on'`, `video: 'on'`, `trace: 'retain-on-failure'` —
  failures should be debuggable from artifacts alone.

### Cross-repo PR trigger

Every PR commit on the upstream `fabric_assignment` repo fires a
`workflow_dispatch` into this repo, which runs the full Playwright suite and
posts a `parabank-e2e` commit status back to the upstream SHA so it appears as
a check on the PR. Cross-repo auth uses fine-grained PATs
(`E2E_TRIGGER_PAT` on the upstream side, `UPSTREAM_STATUS_PAT` here).

---

## Architecture Decision Records

Significant cross-cutting decisions are captured in [docs/adr/](docs/adr/).
Start an ADR when a decision affects more than one module, has alternatives a
future contributor would reasonably consider, or encodes a trade-off the code
itself cannot explain.

| #    | Title                                                                                            | Status   |
| ---- | ------------------------------------------------------------------------------------------------ | -------- |
| 0001 | [Test Architecture: Playwright + BDD + POM + Factories](docs/adr/0001-test-architecture.md)      | Accepted |

---

## Conventions

- **Page Object Model.** One class per page under `src/pages/`. Locators as
  getters, actions as async methods, no assertions inside.
- **Steps stay thin.** Step bindings orchestrate page objects and assert; they
  do not contain selectors or business logic.
- **Factories are stateless and pure.** No module-level state, no I/O, no
  logging. They return fully-formed objects ready to use.
- **Shared values live in [Constants.ts](src/common/Constants.ts).** Default
  password, URL paths, navigation links — never hard-code these inside pages
  or steps.
- **Logging via [TestLogger](src/utils/TestLogger.ts) / [ApiLogger](src/utils/ApiLogger.ts).**
  No bare `console.log`.
- **Strict TypeScript.** All shared shapes go in [src/data/types/](src/data/types/).

---

## Troubleshooting

- **`username already exists` on registration** — usually a ParaBank server-side
  false positive, not a real collision. The retry path in
  [RegisterPage.ts](src/pages/RegisterPage.ts) handles this; if it surfaces in
  a test failure, check whether the retry was exhausted.
- **Cloudflare bot challenge** — the suite waits up to 75 s for the challenge
  to clear and logs a `CLOUDFLARE` warning if it does not. Retry the run; if
  it persists, the public instance is under load.
- **`bddgen` errors** — re-run `npm test`; the BDD generator needs to run
  before any Playwright invocation. The `test:*` scripts chain it
  automatically.
- **Stale generated `.spec.js` files** — delete `test-results/` and the
  generated `.features-gen/` directory and re-run.
