# CryptoTrade Pro Database Schema

The database is MySQL-compatible and defined in `drizzle/schema.ts`. All business timestamps are UTC timestamps. User-owned records are scoped by `userId` in every read and write helper.

## Identity and provider-backed discovery

| Table | Purpose | Key columns and indexes |
|---|---|---|
| `users` | Managed-auth identity and role | `id`, unique `openId`, `role`, profile timestamps |
| `traders` | Provider-backed trader registry record | `provider`, `providerTraderId`, `name`, strategy metrics, `status`; indexes on provider identity and status |

`traders.ownerUserId` optionally links a provider-backed profile to a user and cascades on owner deletion. The application does not seed trader rows.

## Copy trading and automation

| Table | Purpose | Key columns and indexes |
|---|---|---|
| `copy_trades` | User copy-trading intent and lifecycle | `userId`, `traderId`, `status`, `allocationBps`, `maxLossBps`; indexes on user/status and trader |
| `trading_bots` | Staged or policy-approved strategy configuration | `userId`, `name`, `strategy`, `symbol`, allocation and risk basis points, lifecycle `status`; index on user/status |

`copy_trades.traderId` cascades when a trader registry record is removed. Copy rows represent intent and are not executed positions without broker-linked execution records. Bot rows represent configuration and lifecycle, not proof of fills.

## Advisory signals

| Table | Purpose | Key columns and indexes |
|---|---|---|
| `trading_signals` | Informational provider/LLM advisory output | `provider`, `model`, `symbol`, `direction`, `confidenceBps`, `reasoning`, `status`, `expiresAt`; indexes on symbol/status and creation time |

Signal rows may reference the generating user, but deletion of that user sets the reference to null. Signals cannot authorize or submit orders.

## Persisted paper ledger

| Table | Purpose | Key columns and indexes |
|---|---|---|
| `paper_accounts` | User-funded paper cash | Unique `userId`, decimal `cashBalance`, creation/update timestamps |
| `paper_orders` | Paper order lifecycle | `userId`, symbol, side, `orderType`, decimal quantity/prices, executed quantity, average fill, `status`; indexes on user/status and user/creation time |
| `paper_fills` | Immutable paper execution log | `orderId`, `userId`, symbol, side, decimal quantity/price, decimal `realizedPnl`, creation time; indexes on user/creation time and order |
| `paper_positions` | Net paper long position and cost basis | Unique `(userId, symbol)`, decimal quantity, average entry, realized P&L, update time |

Paper market orders create a filled order and immutable fill inside one transaction after cash or position validation. Paper limit orders are open until a matching provider exists. Filled buys reduce paper cash and increase average cost basis. Filled sells require sufficient quantity, increase cash, reduce position quantity, and persist realized P&L. The ledger does not create short positions.

## Operational audit

| Table | Purpose | Key columns and indexes |
|---|---|---|
| `audit_logs` | User-scoped safety and adapter outcomes | `userId`, `eventType`, outcome enum (`allowed`, `rejected`, `unavailable`), optional broker/symbol, message, redacted metadata; indexes on user/creation time and event type/creation time |

Audit metadata is filtered for key, secret, passphrase, token, and credential-shaped keys before insertion. The Settings audit panel reads only the authenticated user’s recent events.

## Relationships and deletion behavior

The user is the root owner for paper accounts, paper orders, paper fills, positions, copy plans, and bots. Deleting a user cascades to those owned records. Audit rows retain operational history by setting a deleted user reference to null. Paper fills cascade from their parent paper order. Trader ownership is optional and cascades from the owner user, while copy plans cascade from their referenced trader.

## Migration workflow

Schema changes are generated from the TypeScript definition and reviewed before application. The paper-ledger tables were introduced through a non-destructive migration. After a migration, run `pnpm check`, `pnpm test`, and `pnpm build`, then verify affected routes and safety states in the browser.
