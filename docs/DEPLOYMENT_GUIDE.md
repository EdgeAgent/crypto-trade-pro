# CryptoTrade Pro Deployment Guide

CryptoTrade Pro is intended to run on the managed web project hosting supplied with this workspace. The managed environment provides the Node runtime, database connection, authentication configuration, built-in LLM proxy, and storage integration. External hosting can introduce compatibility differences and is not required for the current project.

## Pre-release checks

Run the following commands from the project root:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Review `todo.md`, the generated Drizzle migration, and the current live-readiness copy. Confirm that no provider credential, placeholder value, test fixture, or fabricated trader/market record is committed. Verify the primary routes at desktop and phone widths.

## Secrets and integrations

Use the project’s managed Secrets settings for environment values. Broker keys, API secrets, passphrases, LLM provider keys, and webhook credentials must never be placed in client code, database seed data, logs, or screenshots. The current broker fields in Settings are placeholders and do not enable execution. A live adapter should be added only after credential readiness, risk limits, explicit confirmation, idempotency, and settlement reconciliation are implemented.

## Database deployment

Schema changes are generated from `drizzle/schema.ts`. Review each migration before applying it. The paper-ledger migration creates user-scoped paper accounts, orders, fills, and positions without dropping existing data. After applying a migration, verify table existence and run the complete type-check and test suite.

## Checkpoint and publish flow

Create a managed project checkpoint after a verified milestone. The checkpoint is the reviewable artifact for rollback and publishing. Publishing is a deliberate Management UI action and should be performed only after the project owner reviews the checkpoint and confirms the environment configuration.

## Operational readiness

Before enabling any background or broker-backed workload, add structured audit visibility, failure alerts, retry policy, rate limits, and data-retention decisions. Test provider outages and authentication failures. The app should remain safe and legible when a provider is offline: it must show loading, offline, unavailable, or empty states rather than stale or invented execution data.
