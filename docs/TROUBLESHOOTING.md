# CryptoTrade Pro Troubleshooting

## The dashboard shows Connecting or Empty

Market feeds depend on provider availability. Check the browser console and network logs for provider status, then wait for the resilient reconnect or CoinGecko fallback. A connecting or empty state is expected when no provider response is available and is not a fabricated market snapshot.

## The Trading page says a quote is required

Paper market orders intentionally require a current provider-backed quote. Select a supported pair and wait for the live ticker to become live. A limit order can be created with a valid limit price, but it remains open until a matching paper execution provider exists.

## A paper buy says insufficient cash

Paper cash is explicitly funded and no starting balance is created automatically. Use the Paper account funding control. The funding action is persisted to the authenticated user’s paper account. If the database is unavailable, the server returns a service-unavailable error rather than creating an in-memory balance.

## A sell says insufficient position

The ledger does not create short positions. Sell quantity must not exceed the user’s persisted net long position for the selected symbol. Review the Positions and Fills section before submitting the sell.

## An open limit order cannot be edited or cancelled

Only open limit orders owned by the authenticated user can be modified or cancelled. Filled, cancelled, rejected, market, and other users’ orders are not eligible. Refresh the Pending orders panel if another session changed the order.

## GO LIVE is unavailable

Live execution remains locked until broker readiness, daily loss-limit validation, and explicit confirmation are satisfied. Placeholder fields in Settings do not count as configured credentials. The current environment also has no enabled broker adapter, so a server-side unavailable result is expected even after the safety gate passes.

## Advisory generation does not appear

Signals require a live quote and a functioning advisory provider. AI output is stored as a time-limited informational record. Check the Signals provider status and use the feed’s loading, empty, or error state as the source of truth.

## Database migration failure

Stop before retrying destructive commands. Review the generated SQL, confirm `DATABASE_URL`, inspect whether the target tables already exist, and compare the migration with the live schema. After any repair, run `pnpm check`, `pnpm test`, and `pnpm build` before creating a new checkpoint.

## Authentication appears missing

Protected procedures require the managed authentication session cookie. Confirm that the app is opened on the managed project origin, that cookies are permitted, and that the user has completed the sign-in flow. Do not bypass the protected procedure with client-side cookie handling.
