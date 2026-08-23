# CryptoTrade Pro API Reference

The application API is exposed through tRPC under `/api/trpc`. Client code should use the generated bindings in `client/src/lib/trpc.ts` rather than hand-written fetch wrappers. Protected procedures require the managed authenticated session.

## Trading procedures

| Procedure | Type | Input | Behavior |
|---|---|---|---|
| `trading.getPaperAccount` | query | none | Returns the authenticated user’s persisted cash balance and whether an account exists. |
| `trading.fundPaperAccount` | mutation | `{ amount: positive number, max 1,000,000 }` | Explicitly increases persisted paper cash; it does not move real money. |
| `trading.placeMarketOrder` | mutation | `{ symbol, side: BUY\|SELL, quantity, price }` | Validates cash or position availability, persists a filled order and immutable fill, and updates the position in one transaction. |
| `trading.placeLimitOrder` | mutation | `{ symbol, side, quantity, limitPrice }` | Persists an open limit order. It is not presented as filled until a matching provider exists. |
| `trading.modifyOrder` | mutation | `{ orderId, quantity, limitPrice }` | Changes only an authenticated user’s open limit order. |
| `trading.cancelOrder` | mutation | `{ orderId }` | Cancels only an authenticated user’s open order. |
| `trading.getPendingOrders` | query | none | Lists the user’s open paper orders. |
| `trading.getTradeHistory` | query | none | Lists detailed immutable fills with order linkage, symbol, side, price, quantity, notional, realized P&L, and timestamps. |
| `trading.getTrades` | query | none | Returns the legacy table-shaped fill summary for compatibility. |
| `trading.getPositions` | query | none | Returns persisted net long positions. Current mark and unrealized P&L remain null when no provider quote is available. |
| `trading.placeLiveMarketOrder` | mutation | broker, symbol, side, quantity, price, daily loss state, and `explicitConfirmation: true` | Runs the server-side live safety gate. The current adapter boundary records an unavailable audit outcome and refuses execution until a broker adapter is enabled. |

Paper order errors use a precondition failure when cash, position, quote, or database requirements are not satisfied. Unknown or ineligible order edits and cancellations return not-found semantics to avoid leaking another user’s records.

## Signals procedures

Signals expose provider-backed advisory records and an authenticated generation action. Generation requires a current market snapshot and uses the configured built-in LLM proxy with structured output. Responses include provider/model metadata, direction, confidence, reasoning, and expiry. Signal records never submit orders. The public feed may return an honest empty collection when no active provider-backed record exists.

## Copy-trading procedures

Copy routes list provider-backed traders, create user-owned staged copy plans, and update staged/active/paused/stopped lifecycle state. A copy plan is intent, not proof of execution. The server rejects copy actions that require a missing trader registry, persistence connection, or broker execution provider.

## Bot procedures

Bot routes create user-owned strategy configurations and update lifecycle state. Bot performance is returned only from persisted records. Without provider-backed execution history, the UI shows an honest empty state instead of invented returns.

## Audit procedures

`audit.listRecent` is protected and returns recent user-scoped operational events. The response contains event type, outcome, broker, symbol, message, and timestamp. Credential-shaped metadata is redacted before database insertion; keys matching key, secret, passphrase, token, or credential are not retained.

## Error and availability semantics

Clients must distinguish loading, offline, unavailable, empty, rejected, and successful states. A provider outage must not be rendered as a zero-price success. A live-order rejection must not be retried automatically without a new explicit user action. All user-visible success copy should correspond to a persisted row or a verified provider response.
