# Cross-repo triggers for parabank-playwright

Files in this directory are **not** executed by GitHub — `.github/workflows/`
is the only path GitHub runs. These are templates that should be copied into
other repos that want to trigger the E2E suite here.

## Setup — one-time per upstream repo

### 1. Copy the trigger workflow

| Upstream repo | Source file | Destination path |
| --- | --- | --- |
| `sonalpriya17/fabric_assignment` | [fabric-assignment-trigger.yml](fabric-assignment-trigger.yml) | `.github/workflows/trigger-parabank-e2e.yml` |

### 2. Create the dispatch PAT

Create a **fine-grained personal access token**:

- **Resource owner:** `sonalpriya17`
- **Repository access:** only `sonalpriya17/parabank-playwright`
- **Permissions:** `Actions: Read and write`, `Metadata: Read-only`

Save it in the upstream repo as a secret named `E2E_TRIGGER_PAT`
(Settings → Secrets and variables → Actions → New repository secret).

### 3. Create the status-posting PAT (in **this** repo)

Create a second fine-grained PAT:

- **Resource owner:** `sonalpriya17`
- **Repository access:** each upstream repo (e.g. `fabric_assignment`)
- **Permissions:** `Commit statuses: Read and write`, `Metadata: Read-only`

Save it in `parabank-playwright` as `UPSTREAM_STATUS_PAT`.

### 4. (Optional) Gate upstream PRs on E2E

In the upstream repo: **Settings → Branches → Branch protection → main →
Require status checks to pass → add `parabank-e2e`**. The check name won't
be selectable until we've posted it at least once, so let one run complete
first.

## How the flow runs

```
Commit in fabric_assignment
        │
        ▼
trigger-parabank-e2e.yml
(uses E2E_TRIGGER_PAT) ──► repository_dispatch (type=upstream-push)
                                      │
                                      ▼
                        parabank-playwright workflow fires
                                      │
                      ┌───────────────┼───────────────┐
                      ▼               ▼               ▼
              status=pending     Playwright     status=success|failure
              on upstream SHA    tests run      on upstream SHA
              (via UPSTREAM_STATUS_PAT)
```

## Adding more upstream repos later

Drop another trigger file in this directory (e.g. `backend-api-trigger.yml`),
change `source_repo` in the client payload, and copy it to that repo. The
`upstream-push` event type is generic — `source_repo` in the payload tells
the receiver which upstream triggered it.
