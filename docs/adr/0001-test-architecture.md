# ADR 0001 — Test Architecture: Playwright + BDD + POM + Factories

- **Status:** Accepted
- **Date:** 2026-04-20
- **Decider:** Sonal

## Context

We needed an end-to-end test suite for [ParaBank](https://parabank.parasoft.com),
a public banking demo application. The suite has to satisfy a mixed audience
and a hostile target environment, both of which constrain the architecture:

**Audience.** Engineers, QA, and (occasionally) product reviewers all read the
test output. Engineers want fast, deterministic feedback in CI. QA want to
author and modify scenarios without touching framework plumbing. Reviewers
want to read a feature file and understand what is being tested without
learning Playwright.

**Target environment.** ParaBank is a shared public instance. That means:

1. **No data cleanup.** Every registered user, opened account, and posted
   transaction is permanent. We cannot rely on fixtures or replay.
2. **Shared rate limits.** Other projects also run against this instance, so
   we cannot hammer it with high parallelism.
3. **Cloudflare in front of it.** Tests occasionally hit a bot-challenge
   interstitial.
4. **Server-side flakes.** ParaBank's registration endpoint occasionally
   returns false-positive "username already exists" responses for usernames
   that demonstrably do not exist.
5. **Loose validation.** The form accepts data that real banks would reject
   (invalid SSNs, etc.), so we do not have to model real-world validity rules.

We needed an architecture that gave us readable scenarios for non-engineers,
strong typing and reuse for engineers, and resilience to the environment's
flakes — without leaking environment workarounds into the scenarios themselves.

## Decision

We adopt a four-layer architecture, each layer owning one concern and
depending only on the layers below it:

```
   features/*.feature       ← Gherkin: business intent, plain English
            │
   src/steps/*.steps.ts     ← Step bindings: orchestration + assertions
   src/common/CommonSteps   ←   (cross-cutting: registration, navigation)
            │
   src/pages/*Page.ts       ← Page Object Model: UI interactions
   src/client/*Client.ts    ← REST clients: API interactions
            │
   src/data/factories/*     ← Synthetic test data (UserFactory, ...)
   src/data/types/*         ← Shared types (UserData, SessionData, ...)
   src/common/Constants.ts  ← URLs, default password, paths
```

### Project structure

The on-disk layout maps directly onto the four layers above. Each directory
owns exactly one concern, so a contributor knows where new code goes without
reading the whole tree.

```
.
├── features/                  Gherkin .feature files, grouped by capability
│   ├── accounts/                opening, balances, statements
│   ├── billpay/                 paying registered billers
│   ├── login/                   credential happy/sad paths
│   ├── navigation/              header / sidebar link coverage
│   ├── registration/            new-user signup
│   ├── transactions/            history, search, find-by-amount
│   └── transfers/               between-account fund movement
├── src/
│   ├── client/                REST clients for direct API assertions
│   │   └── TransactionClient.ts   verifies UI-triggered transactions via API
│   ├── common/               Cross-cutting code shared by all layers
│   │   ├── CommonSteps.ts         Given-steps reused across features (e.g. "a new user is registered")
│   │   ├── Constants.ts           URLs, paths, default password — single source of truth
│   │   └── ResponseMessages.ts    expected UI strings, kept out of step files for i18n / drift
│   ├── data/
│   │   ├── factories/             stateless data builders (UserFactory, ...)
│   │   └── types/                 shared TypeScript shapes (UserData, SessionData, BillPayeeData)
│   ├── fixtures/             Playwright fixtures: page objects, REST clients, per-test session
│   │   └── index.ts               single extend() point — every step gets typed fixtures
│   ├── hooks/                Before/After hooks (logging, artifact attachment)
│   │   └── hooks.ts
│   ├── pages/                Page Object Model — one class per ParaBank page
│   │   ├── BasePage.ts            shared navigation + common locators
│   │   └── *Page.ts               one per route under /parabank/
│   ├── steps/                Gherkin step bindings, one file per feature group
│   │   └── *.steps.ts             thin orchestration over page objects + assertions
│   └── utils/                Cross-cutting helpers
│       ├── DataTableParser.ts     resolves <generated>, <sessionKey>, <defaultPassword> sentinels
│       ├── TestLogger.ts          structured per-test logging
│       └── ApiLogger.ts           request/response logging for REST clients
├── scripts/                  CI helpers (Node ESM)
│   ├── parse-results.mjs          turns Playwright JSON into a digest
│   ├── render-summary.mjs         renders the GitHub Actions step summary
│   └── post-pr-comment.mjs        posts the digest as a PR comment
├── docs/
│   └── adr/                       Architecture Decision Records (this file lives here)
├── README.md                 entry point: quick start, layout, conventions, links to ADRs
├── playwright.config.ts      runner config: parallelism, retries, reporters, trace
├── tsconfig.json
└── package.json
```

**Why this shape.** Three rules keep the tree honest:

1. **One concern per directory.** Selectors live only in `pages/`. Assertions
   live only in `steps/`. Test data lives only in `data/factories/`. Cross-
   cutting helpers live in `utils/` or `common/` — never inline in a page or
   step.
2. **Features mirror business capabilities, not pages.** A `transfers/`
   scenario may touch `TransferFundsPage`, `AccountsOverviewPage`, and
   `TransactionClient` — grouping by capability keeps related scenarios
   together for non-engineer reviewers.
3. **`common/` is for things every layer can import; `utils/` is for
   stateless helpers.** The split prevents `common/` from becoming a
   dumping ground.

### Tooling choices

| Concern                | Choice                              | Why                                                                                                       |
| ---------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Browser automation     | **Playwright**                      | Auto-waiting, trace viewer, parallel-by-default, first-class TypeScript.                                  |
| BDD layer              | **playwright-bdd**                  | Gives us Gherkin without leaving Playwright Test — same fixtures, same reporter, same retry semantics.    |
| Test data              | **`@faker-js/faker` + `crypto.randomUUID`** | Faker for human-shaped fields; UUID for the entropy that actually prevents username collisions across CI shards. |
| Language               | **TypeScript (strict)**             | Catches drift between page objects, step bindings, and types at compile time.                             |
| Linting                | **eslint + @typescript-eslint**     | Standard.                                                                                                 |

### Conventions per layer

**Feature files** describe *what* the user does, never *how*. They are
authored in business language and reviewed by anyone, regardless of
engineering background. Data-table overrides use sentinels (`<generated>`,
`<sessionKey>`, `<defaultPassword>`) so scenarios can pin individual fields
without specifying every value.

**Step bindings** are the only layer that knows about both the scenario and
the page objects. They orchestrate page-object calls, read from and write to
the per-scenario `session` fixture, and own all assertions. Steps must not
contain selectors or business logic.

**Page objects** extend a shared `BasePage`. Each ParaBank page gets exactly
one class. Locators are exposed as getters; actions are async methods. Page
objects must not assert — they return data and let the step decide. This keeps
them reusable across scenarios with different expectations.

**REST clients** mirror the page-object shape but for HTTP. Used when an API
assertion is the cleanest way to verify a UI action's side effect (e.g.
checking that a transfer actually posted).

**Factories** are stateless, pure functions returning fully-formed data
objects. They never log, never touch the network, never hold module state
(parallel workers share the module). Pinned values like the default password
live in `Constants.ts`, not the factory, so tests are reproducible by hand.

### Resilience patterns

The hostile environment forces three patterns we would not adopt in a
self-hosted target:

1. **Aggressive uniqueness on test data.** Every username has ~2.4 × 10²⁰
   possible values, with a short session-derived prefix for log
   traceability. ParaBank's permanent persistence makes this non-negotiable.
2. **Outcome-typed waits, not boolean checks.** Registration submits and
   then `Promise.race`s a welcome message, a server-error heading, and a
   form-error message — returning a discriminated union so the step can
   distinguish a true rejection from a transient server error or a
   Cloudflare interstitial. See
   [RegisterPage.submitAndAwaitOutcome](../../src/pages/RegisterPage.ts).
3. **Targeted retries inside page objects, not blanket retries at the
   runner level.** Playwright's global `retries: 3` handles unknown
   flakes; the in-page-object retry on `username already exists` handles
   the one known false-positive specifically.

### Parallelism

`fullyParallel: true`, with `workers: 2` in CI and `3` locally. Bounded
because the target is a shared public instance — higher worker counts get us
rate-limited, not faster.

## Alternatives considered

1. **Plain Playwright Test, no BDD layer.** Rejected. Lost the audience of
   non-engineering reviewers; gained little in return because playwright-bdd
   adds essentially zero runtime overhead and shares Playwright's fixture
   model directly.

- Allure — visually impressive but separate CI generation step, no Trace Viewer
- Cucumber HTML Reporter — requires Cucumber runner, loses Trace Viewer

## Consequences

### Positive

- **Scenarios are reviewable by non-engineers.** A product manager can read a
  `.feature` file and confirm intent without reading TypeScript.
- **Layers are independently replaceable.** Swapping the BDD layer for plain
  Playwright Test would touch `features/` and `src/steps/` only. Swapping
  faker for a different data library touches `src/data/factories/` only.
- **Failures are debuggable from artifacts alone.** Trace, video, and
  screenshot are all on. The HTML report plus the trace viewer is enough to
  diagnose a failure without re-running locally.
- **Adding a new ParaBank page is mechanical.** New page object class, new
  step file, new feature file. No framework changes.

### Accepted trade-offs

- **Two languages to learn.** Contributors need both Gherkin and TypeScript.
  Mitigated by keeping step bindings thin so most TypeScript work happens in
  pages/factories where the patterns are well-established.
- **playwright-bdd is a smaller community than vanilla Playwright Test


## References

- Repo overview: [README.md](../../README.md)
- Playwright config: [playwright.config.ts](../../playwright.config.ts)
- Fixtures: [src/fixtures/index.ts](../../src/fixtures/index.ts)
- Cross-cutting steps: [src/common/CommonSteps.ts](../../src/common/CommonSteps.ts)
- Data-table override mechanism: [src/utils/DataTableParser.ts](../../src/utils/DataTableParser.ts)
- Resilience example: [src/pages/RegisterPage.ts](../../src/pages/RegisterPage.ts)
- Test data factory: [src/data/factories/UserFactory.ts](../../src/data/factories/UserFactory.ts)
