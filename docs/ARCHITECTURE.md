# CryptoTrade Pro Architecture

**CryptoTrade Pro** is a React 19 and TypeScript trading workspace backed by an Express server, tRPC 11, Drizzle ORM, and MySQL-compatible persistence. The application is intentionally safety-first: market intelligence can be live, while order execution is separated into persisted paper execution and a server-gated live path.

## Runtime topology

| Layer | Responsibility | Primary locations |
|---|---|---|
| React client | Responsive terminal UI, charts, account controls, trading forms | `client/src/pages`, `client/src/components` |
| tRPC client | Type-safe request contracts and cache invalidation | `client/src/lib/trpc.ts` |
| Express/tRPC server | Authenticated procedures, provider orchestration, execution gates | `server/_core`, `server/routers` |
| Persistence | Users, trader/copy plans, bots, signals, paper ledger, audit events | `drizzle/schema.ts`, `server/db.ts` |
| Provider streams | Binance WebSocket recent trades/order book and CoinGecko REST fallback | `client/src/hooks`, `client/src/lib` |
| LLM advisory | Structured, informational signal generation through the built-in proxy | `server/routers/signals.ts` |

## Request and execution flow

Market data is read independently of order execution. The browser subscribes to the selected-pair live ticker and resilient Binance streams, falling back to CoinGecko REST when appropriate. A paper market order sends the current provider-backed quote to the server, where the server validates quantity, cash, and position ownership inside a database transaction before inserting an order and immutable fill. A paper limit order is persisted as open; it is not presented as filled until a matching provider exists.

Live orders use a separate server procedure. The procedure requires a supported broker, verified credential readiness, a positive daily loss limit, loss usage below that limit, and an explicit per-order confirmation. The current adapter boundary records an unavailable audit event and refuses submission until a real broker adapter is configured. UI placeholders never reach an exchange.

## Data model

The paper ledger is composed of four user-scoped tables. `paper_accounts` stores explicitly funded cash and never creates a default balance. `paper_orders` stores lifecycle state (`open`, `filled`, `cancelled`, or `rejected`). `paper_fills` is immutable execution history. `paper_positions` stores net long quantity, average entry price, and realized P&L. Decimal columns are used at the persistence boundary and values are normalized to eight decimal places in server helpers.

Advisory signals are stored in `trading_signals` with provider, model, symbol, direction, confidence, reasoning, and expiry. Signals are informational and cannot submit orders. `audit_logs` stores safety and adapter outcomes with credential-shaped metadata removed before persistence.

## Safety boundaries

> The application must not claim execution, balances, trader performance, or signal activity that is not backed by a provider or persisted record.

This rule drives the empty and unavailable states throughout the UI. A missing trader registry produces no trader cards. A missing paper balance is shown as `$0.00` until the user funds the account. Missing current quotes produce a quote-pending position mark rather than a fabricated P&L. AI output is labeled advisory and does not grant execution authority.

## Extension points

Broker adapters should implement a common server-side interface with credential validation, symbol normalization, order submission, settlement reconciliation, and redacted audit outcomes. A trader registry should write provider-backed `traders` rows. Background execution for bots, signal refresh, or alerts should be designed with the project’s heartbeat/scheduling guidance before implementation so retries, idempotency, and shutdown behavior are explicit.
