# Signals browser verification

Date: 2026-08-23

The real browser opened `/signals` successfully without a session cookie. The route rendered the advisory-only disclosure, a valid live BTC snapshot sourced from the CoinGecko REST fallback, and an enabled `Generate advisory` control. The persisted signal feed resolved to `awaiting-provider` with `No live signals available` rather than remaining stuck in loading or inventing signal cards. No order-execution language was presented as an automatic action.
