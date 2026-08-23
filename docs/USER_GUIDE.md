# CryptoTrade Pro User Guide

CryptoTrade Pro is a market-analysis and guarded execution workspace. It is designed to make the boundary between information, paper execution, and real-money execution visible at every step.

## Start with the dashboard

The dashboard presents provider-backed market activity, the account mode, and links into Markets, Trading, Traders, Signals, Bots, and Settings. Market cards may display loading, live, offline, or empty states depending on provider availability. Values in these states are not synthetic.

## Paper trading

Paper trading is the default. Open **Trading**, select a pair, choose Buy or Sell, and select Market or Limit. A market order uses the current live quote displayed by the selected-pair feed. It fills only after the server validates cash or position availability and writes the order and fill to the paper ledger. A limit order is persisted as open and remains unfilled until a matching paper execution provider is connected. Open limit orders can be edited or cancelled.

Paper cash is not created automatically. Use the paper-account funding control to add a user-selected amount. This is a ledger action for the paper environment and does not move real money. The account card shows the persisted cash balance. Positions show quantity and average entry price; the selected pair can show a provider-backed mark, while symbols without a current quote remain marked as pending.

## Live-readiness gates

The **GO LIVE** control remains safety-gated. Settings contains broker connection fields for Binance, Coinbase, and Kraken, plus risk controls and AI model preferences. The visible fields are connection placeholders until a secure broker integration is configured. A live order requires broker readiness, a valid daily loss limit, loss usage below that limit, and an explicit confirmation for that order. If any gate fails, the server rejects the request and records a redacted audit event.

## Signals and AI advisory output

Signals are research output, not instructions or guarantees. Provider-backed signals display the provider, model, direction, confidence, expiry, and reasoning. The generator requires a live quote and stores a time-limited advisory record. It cannot place orders. If no signal provider record exists, the feed shows an honest empty state.

## Traders, copy plans, and bots

Traders are shown only when a provider-backed registry supplies records. Copy plans can be staged, activated, paused, or stopped, but they are not represented as executed positions unless a broker-linked execution provider records those positions. Bots use the same explicit lifecycle and remain controlled automation until broker and policy gates are enabled.

## Settings and audit activity

Settings contains broker placeholders, risk controls, performance analytics, and recent safety activity. Performance metrics use persisted fills or broker state. Audit activity shows recent user-scoped gate and adapter outcomes without exposing credentials, tokens, secrets, or passphrases.

## Important limitations

Stop-loss and take-profit automation, real broker adapters, trader-registry discovery, social sentiment integrations, Discord alerts, and background bot execution are not enabled in the current build. These areas remain visibly gated or empty rather than being simulated.
