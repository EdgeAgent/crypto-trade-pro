# CryptoTrade Pro Developer Guide

## Prerequisites and local setup

Use Node.js 22 or a compatible current Node release, pnpm, and a MySQL-compatible database. The project expects environment values to be injected by the managed platform; do not commit `.env` files or embed provider credentials in source.

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

The development server runs through `server/_core/index.ts` and serves the client and tRPC API from the managed project runtime. The production commands are `pnpm build` and `pnpm start`.

## Repository conventions

Use tRPC procedures for application API calls and consume them with generated hooks. Keep database access in `server/db.ts` and use protected procedures for user-scoped data. Use existing shadcn components and the shared design tokens rather than introducing parallel UI primitives. Keep loading, error, unavailable, and empty states explicit.

The project maintains `todo.md` as a code-verifiable implementation history. Add a pending item before starting a requested change and mark it complete only after tests and relevant visual checks pass. Keep all media outside the project directory and use the managed storage workflow for uploaded assets.

## Schema-first database workflow

Update `drizzle/schema.ts`, generate a migration, review the generated SQL for destructive operations, and apply the migration through the managed database workflow. Add typed helpers in `server/db.ts`, then add or update tRPC procedures and client hooks. The paper ledger is a useful reference: tables store decimal values, helpers scope every query by user ID, and order-plus-fill-plus-position updates occur in a transaction.

```bash
pnpm drizzle-kit generate
pnpm check
pnpm test
pnpm build
```

Never use destructive SQL casually. Foreign keys and indexes should be reviewed in the generated migration before application.

## Testing expectations

Vitest covers safety gates, live-stream state transitions, redacted audit metadata, component markup contracts, and router rejection paths. Add deterministic tests for every new safety boundary. Browser screenshots complement but do not replace unit tests. For provider integrations, test parsing and failure states without fabricating successful provider responses.

## Adding a broker adapter

Implement a server-side adapter behind a common interface. Credential values must remain server-side, readiness must be verified before submission, symbol and quantity precision must be validated, and every result must be captured as an allowed, rejected, or unavailable audit event with metadata redaction. Add idempotency keys and settlement reconciliation before enabling a live adapter. Do not treat Settings placeholders as credentials.

## Adding scheduled work

Before adding recurring bot execution, signal refresh, alerts, or cleanup jobs, follow the project scheduling and heartbeat guidance. Job handlers must be idempotent, retry-safe, observable, and explicit about what happens when the process is interrupted.
