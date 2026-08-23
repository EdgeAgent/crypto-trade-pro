# Paper Ledger Mobile Verification

The registered Trading route is `/trading` (not `/trade`). At 375x812, the route rendered the compact navigation shell, live quote/order-book/recent-trades sections, guarded live-order panel, paper order form, explicit $0.00 paper account with funding control, open-limit empty state, and ledger snapshot empty state without overflow. The first `/trade` capture correctly returned the application’s 404 page and was not treated as a product defect because that route is not registered.

The Settings, Signals, Traders, and Bots routes were also captured at 375x812 before this note. Settings showed the safety-gated paper mode disclosure; Signals showed the advisory-only warning and live-quote gating; Traders showed an honest no-live-traders state; and Bots showed the controlled automation builder.

Verification evidence: TypeScript check passes and Vitest reports 44 passing tests across 12 files after the paper ledger, order modification, and detailed trade-history changes.
