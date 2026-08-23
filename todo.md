# CryptoTrade Pro - Enterprise Trading Platform TODO

## Phase 1: Core Dashboard & Live Data ✅
- [x] Dark theme with cyan accents
- [x] Portfolio tracking with $1000 starting balance
- [x] Live crypto data from CoinGecko API
- [x] Top cryptocurrencies display
- [x] Markets page with search and sorting
- [x] Trading page with order placement UI

## Phase 2: Advanced UI & Professional Interface
- [x] Interactive candlestick charts with Recharts (provider-backed OHLC)
- [x] Multiple timeframe selector (1H, 4H, 1D, 1W)
- [x] Technical indicators (RSI, MACD, Bollinger Bands)
- [x] Order book display with bid/ask depth
- [x] Recent trades panel
- [x] Advanced search with filters
- [x] Asset detail pages with comprehensive stats
- [x] Responsive mobile-first design
- [x] Smooth animations and transitions

## Phase 3: Live Trader & Copy Trading (from AI-Trader)
- [x] Trader discovery and search
- [ ] Trader leaderboard (by win rate, returns, followers) — pending live trader registry
- [ ] Trader profile pages with performance metrics
- [x] One-click copy trading UI
- [x] Active copies dashboard (persisted empty/live state)
- [x] Copy trade history and performance tracking (persisted intent history; broker-linked performance remains unavailable without a broker)
- [ ] Follower/reputation system — pending persistent trader registry
- [ ] Trader signal publishing
- [x] Signal feed with real-time updates via SSE with polling fallback

## Phase 4: AI Signal Generation (from Gemini Agent)
- [ ] LunarCrush API integration for social sentiment
- [ ] Google Gemini AI signal generation
- [ ] Inngest background job orchestration
- [ ] Real-time progress tracking UI
- [x] Trading signals database
- [x] Confidence score display (provider-backed signal records)
- [x] Signal reasoning/explanation (provider-backed advisory output)
- [ ] Discord alert notifications
- [ ] Signal performance tracking

## Phase 5: Paper Trading Engine
- [x] Market order execution — persisted fill at the submitted live quote after cash/position validation
- [x] Limit order execution — persisted open order requiring a future matching provider
- [ ] Stop-loss orders
- [ ] Take-profit orders
- [x] Order modification and cancellation — open paper limit modification and cancellation
- [x] Position tracking — persisted net long positions
- [ ] P&L calculations (realized and unrealized) — realized is persisted; unrealized remains quote-dependent
- [x] Trade history with detailed logs — immutable fills with order linkage, symbol, fill price, notional, and realized P&L
- [x] Order status updates — open, filled, and cancelled states

## Phase 6: Strategy Bot Deployment
- [x] Bot creation UI
- [x] Strategy parameter configuration
- [x] Bot status management (active/paused/stopped)
- [ ] Backtesting framework
- [x] Performance metrics dashboard (honest persisted empty state)
- [ ] Bot execution logs
- [ ] Strategy templates library
- [ ] Custom strategy code editor
- [ ] Bot performance analytics

## Phase 7: GO LIVE Switch & Real Trading
- [x] Paper ↔ Live trading toggle
- [ ] Real broker API integration (Binance, Coinbase)
- [ ] Live order execution
- [x] Risk management controls
- [ ] Position sizing calculator
- [ ] Stop-loss enforcement
- [ ] Slippage monitoring
- [ ] Real-time settlement
- [ ] Account balance sync

## Phase 8: Watchlist & Portfolio Management
- [x] Add/remove from watchlist
- [x] Watchlist organization
- [ ] Price alerts
- [ ] Holdings management
- [ ] Portfolio rebalancing tools
- [ ] Asset allocation visualization
- [ ] Performance attribution
- [ ] Tax reporting (optional)

## Phase 9: Scalability & Performance
- [x] WebSocket for real-time data (verified scope: Binance recent-trades and order-book streams)
- [ ] Redis caching layer
- [ ] Database indexing optimization
- [ ] Load balancing
- [ ] Rate limiting
- [ ] API response caching
- [x] Frontend code splitting
- [ ] Image optimization
- [ ] CDN integration

## Phase 10: Security & Compliance
- [ ] API key management
- [ ] Two-factor authentication
- [ ] Encrypted password storage
- [ ] Rate limiting per user
- [ ] Audit logging
- [ ] Data encryption at rest
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Input validation

## Phase 11: Testing & Quality Assurance
- [ ] Unit tests for trading logic
- [ ] Integration tests for API flows
- [ ] E2E tests for critical paths
- [ ] Load testing
- [ ] Security testing
- [x] Mobile responsiveness testing
- [x] Browser compatibility testing — desktop and phone Chromium route captures pass
- [ ] Performance profiling

## Phase 12: Documentation & Deployment
- [x] API documentation — current tRPC contract reference in docs/API.md
- [x] User guide
- [x] Developer guide
- [x] Deployment guide
- [x] Architecture documentation
- [x] Database schema documentation — dedicated table/relationship/index reference in docs/DATABASE_SCHEMA.md
- [x] Environment setup guide
- [x] Troubleshooting guide

## Database Schema Extensions
- [x] traders table
- [x] copy_trades table
- [x] trading_signals table
- [x] trading_bots table
- [ ] social_sentiment table
- [ ] bot_performance table
- [ ] price_alerts table
- [x] audit_logs table

## API Integrations
- [ ] LunarCrush API
- [ ] Google Gemini API
- [ ] Inngest API
- [ ] Binance API (live trading)
- [ ] Coinbase API (live trading)
- [x] WebSocket connections (verified scope: shared resilient service used by trades and order book)
- [ ] Redis connection

## UI Components to Build
- [x] Trader Discovery component
- [x] Copy Trading Dashboard (staged plans and honest broker-unavailable state)
- [x] Signal Feed component (provider-backed empty state until a signal provider is connected)
- [x] Bot Builder interface
- [x] Advanced Charts (provider-backed OHLC with honest unavailable state)
- [x] Order Book component
- [x] GO LIVE Switch toggle
- [x] Risk Dashboard
- [x] Performance analytics
- [x] Settings panel


## Clarified Live-Readiness UI Requirement
- [x] Add clearly labeled Binance API key and secret placeholders in Settings
- [x] Add clearly labeled Coinbase API key, secret, and passphrase placeholders in Settings
- [x] Add clearly labeled Kraken API key and secret placeholders in Settings
- [x] Add OpenRouter API key placeholder and NVIDIA Nemotron/free-model selector in Settings
- [x] Show that placeholders do not activate live execution until credentials are configured and GO LIVE is explicitly confirmed
- [x] Keep all placeholder values out of source code, database seeds, and network requests
- [x] Add UI tests for placeholder visibility and live-mode blocking state

## Clarified Live-Readiness UI Requirement — Implementation Notes
- [x] Broker fields are session-only UI placeholders and are not submitted to any exchange
- [x] GO LIVE remains disabled while broker readiness is false
- [x] Positive daily loss limit is displayed beside the execution state
- [x] Real-capital disclosure is shown beside the live-mode controls
- [x] Shared live-readiness validator has unit coverage
- [x] TypeScript and Vitest checks pass after the UI update

## User-Requested Live Trading Scope
- [x] Preserve paper mode as the default safety state
- [x] Require broker readiness and daily loss limit validation before any live order path
- [x] Do not execute real orders without explicit user confirmation in the app
- [x] Display a prominent real-capital risk disclosure beside the GO LIVE control
- [x] Keep AI signal generation advisory unless the user separately enables an execution policy
      


## Remaining Readiness Gaps
- [x] Build a dedicated Risk Dashboard component showing broker status, readiness, daily loss utilization, and alerts
- [x] Add frontend/component tests for broker and OpenRouter placeholder visibility
- [x] Add frontend/component test confirming GO LIVE stays disabled until readiness conditions are satisfied


## Server-Side Live Order Safety Gaps
- [x] Enforce broker readiness and positive daily-loss validation inside server-side live-order procedures
- [x] Require explicit in-app confirmation on every real order submission
- [x] Add tests proving live-order procedures reject unready accounts and missing confirmations
- [x] Keep order execution disabled while credentials remain UI placeholders


## Final Live Order Confirmation Gaps
- [x] Add a per-order live trading confirmation dialog in the Trading UI
- [x] Send explicitConfirmation only after the per-order dialog is accepted
- [x] Add procedure-level tests for trading.placeLiveMarketOrder rejection paths
- [x] Verify missing broker credentials, invalid daily loss state, and missing confirmation at the tRPC boundary


## Live Data Resilience Gaps
- [x] Implement a reusable live-data WebSocket hook with reconnect and exponential backoff
- [x] Wire resilient streaming beyond the recent-trades tape, including selected-pair market updates or order book state
- [x] Add tests for live-stream connecting, live, offline, and recovery states
- [x] Narrow completion claims to verified live-stream scope until resilient coverage is implemented


## WebSocket Verification Follow-up
- [x] Refactor exchange streaming into one reusable WebSocket service shared by trades and order book
- [x] Add deterministic tests for offline/error and reconnect/recovery transitions
- [x] Narrow broad WebSocket checklist claims to the verified implementation scope


## Component Verification Follow-up
- [x] Build and wire a dedicated TraderDiscovery component
- [ ] Implement a CopyTradingDashboard for followed traders, active copied positions, and performance
- [x] Replace mock signal data with backend-driven signal state and extract a SignalFeed component with loading/error/empty states
- [x] Implement and verify a BotBuilder interface with strategy selection, parameters, validation, and lifecycle controls


## Scope Corrections
- [x] CopyTradingDashboard is explicitly presented as staged copy plans until broker-linked positions exist
- [ ] Full active copied positions and performance attribution remain pending
- [x] Bot lifecycle requirement completed with staged, active, paused, and stopped states

## Copy and Bot Lifecycle Verification Gaps
- [x] Relabel copy dashboard metrics as staged-plan status unless real copied positions are available
- [x] Add explicit copied-position and performance data structures with honest empty states
- [x] Add a distinct stopped bot lifecycle state and controls
- [x] Add tests for copied-position/performance empty states and active/paused/stopped bot transitions


## Live Trader Data Integrity Gaps
- [x] Remove static trader, active-copy, and copy-history records from the copy-trading server router
- [x] Make TraderDiscovery provider-backed with an honest unavailable/empty state when no live trader registry is connected
- [x] Prevent copy/follow mutations from reporting success when no persistence or broker execution provider is connected
- [x] Add tests proving static trader data is not returned and unconfigured copy actions are rejected


## Live Selected-Pair Quote Follow-up
- [x] Replace static Trading-page quote props with a selected-pair Binance ticker stream
- [x] Show honest connecting/offline quote states when the selected-pair ticker is unavailable
- [x] Add deterministic ticker parsing/status tests
- [x] Verify live ticker integration visually on the Trading page — provider-backed live quote and honest chart state rendered; automated component assertion added


## Selected-Pair Ticker Test Gaps
- [x] Add unit coverage for useLiveTicker or an extracted ticker-state helper covering connecting, live, offline, and CoinGecko fallback transitions
- [x] Add a Trading-page/component test for honest waiting-for-quote and offline ticker messaging


## Chart Data Integrity Gaps
- [x] Remove synthetic/random OHLCV generation from CandlestickChart
- [x] Add provider-backed OHLC data by selected asset and timeframe
- [x] Show honest chart loading, unavailable, and empty states
- [x] Add deterministic OHLC parser/timeframe tests
- [x] Verify the chart visually with provider-backed data or its honest unavailable state; automated live/unavailable assertions added


## OHLC Empty-State Follow-up
- [x] Distinguish zero-candle provider responses from network/provider failures
- [x] Render a dedicated chart empty state when no OHLC candles are returned
- [x] Add a component test for the dedicated chart empty state


## Automated Live Visual-State Verification
- [x] Add a Trading-page/component assertion that visible provider-backed quote content replaces the waiting state
- [x] Add CandlestickChart assertions for live-data rendering and honest unavailable rendering
- [x] Reconfirm visual-verification items after automated assertions pass


## Technical Indicator Implementation
- [x] Add deterministic RSI, MACD, and Bollinger Band calculations over provider OHLC closes
- [x] Add chart controls and overlays for RSI, MACD, and Bollinger Bands
- [x] Add indicator loading/insufficient-history states without synthetic fallback data
- [x] Add unit coverage for indicator calculations and chart indicator rendering


## Technical Indicator Verification Follow-up
- [x] Replace MACD LineChart plus Bar composition with a valid ComposedChart configuration
- [x] Add component assertions for RSI, MACD, and Bollinger sections when enabled
- [x] Add insufficient-history indicator rendering assertion
- [x] Re-verify indicator-enabled chart visually after the MACD composition fix; stable-height assertions and real-browser evidence pass


## Recharts Layout Stability Follow-up
- [x] Give the main OHLC and RSI/MACD chart parents explicit stable heights
- [x] Re-verify live price and indicator paths after preventing ResponsiveContainer zero-height measurement; stable-height assertions and real-browser evidence pass


## Indicator Browser-Equivalent Verification
- [x] Assert live indicator chart markup includes stable main, RSI, and MACD dimensions after ComposedChart fix
- [x] Reconfirm the two visual-verification items using passing component assertions and real-browser page evidence recorded in verification_live_chart_browser.md


## Performance Analytics Honesty Follow-up
- [x] Derive win rate, volume, and P&L from actual user trade history or broker state
- [x] Render honest unavailable or zero states when no trade history exists
- [x] Add unit coverage for computed analytics derivation


## Performance Analytics Data-Wiring Follow-up
- [x] Wire PerformanceAnalytics to tRPC trade history on the Risk Dashboard / Settings
- [x] Render honest empty states when trade history is empty


## Trading Router Trade History Query
- [x] Add getTradeHistory query to trading router
- [x] Wire PerformanceAnalytics in Settings to trading.getTradeHistory


## Production Trade Query & Provider Safety Follow-up
- [x] Replace mock trade history with honest empty state or persisted records
- [x] Remove render-time try/catch tRPC wrapper and handle loading/error states properly
- [x] Connect broker connection state to PerformanceAnalytics brokerConnected prop


## Performance Analytics & Settings Integration Gaps
- [x] Create PerformanceAnalytics component with real computed win-rate, volume, and P&L from trade records
- [x] Add getTradeHistory query to trading router
- [x] Wire PerformanceAnalytics in Settings with safe query handling and test coverage


## Production-Ready Mobile & Viral UI Upgrade
- [x] Audit all primary routes at phone and desktop breakpoints for overflow, tap targets, fixed navigation, and loading/error states
- [x] Add production-friendly mobile navigation with accessible focus and safe-area spacing
- [x] Make dashboard, markets, trading, traders, signals, bots, and settings layouts phone-friendly without horizontal overflow
- [x] Add production hardening for user-facing errors, live-data connection states, and disabled live-trading controls
- [x] Refresh the visual identity with distinctive viral/shareable hero treatment, live-status storytelling, and polished micro-interactions
- [x] Add responsive component tests for mobile-critical layout contracts and safety-state copy
- [x] Verify desktop and mobile routes in the browser and save a new checkpoint


## Responsive Regression Coverage
- [x] Assert navigation exposes mobile menu, Settings, and safe paper-mode copy
- [x] Assert holdings and watchlist do not render seeded or random portfolio data
- [x] Assert trading page exposes guarded execution and mobile-sized form contracts; backed by responsiveTrading.test.ts


## Final Production Verification Gaps
- [x] Add responsive Trading assertions for guarded live execution and touch-sized form controls
- [x] Save a checkpoint for the production-ready mobile and visual refresh milestone


## Persistence Contract Design
- [x] Define user-scoped trader profiles with provider identity and performance fields
- [x] Define user-scoped copy-trade intent records with staged/active/paused/stopped lifecycle
- [x] Define user-scoped trading bot records with validated strategy parameters and lifecycle
- [x] Define advisory signal records with provider, model, confidence, reasoning, and timestamps
- [x] Keep all new records free of fabricated seed rows and default to empty live states


## Persisted Entity Query Wiring
- [x] Add protected trader, copy-intent, bot, and signal queries backed by the new tables
- [x] Add protected create/update procedures for staged copy intents and bots with lifecycle validation
- [x] Wire Traders and Bots pages to persisted queries while keeping empty states honest
- [x] Add database-helper and router tests proving empty results when no rows exist


## Persisted Dashboard Completion Gaps
- [x] Wire CopyTradingDashboard to getActiveCopies with live/loading/error/empty states
- [x] Render persisted copy-intent history separately from broker-linked performance data
- [x] Add an honest bot performance metrics panel with no fabricated metrics when execution history is absent
- [x] Add component coverage for active-copy, copy-history, and bot-performance empty states


## Advisory Signal Generation
- [x] Add a live-snapshot advisory generation control to the Signals route
- [x] Gate generation until a real live quote exists and show provider/model status
- [x] Invalidate the persisted signal feed after successful advisory generation
- [x] Add tests for advisory-only copy and quote-unavailable gating


## Signal Delivery Verification
- [x] Add true push delivery for persisted advisory signals via SSE with keepalive and disconnect cleanup
- [x] Add tests covering signal insert/update propagation to subscribed clients
- [ ] Browser-verify generated advisory cards show provider/model, confidence, reasoning, and advisory-only copy — requires authenticated generation action


## Advisory REST Fallback Readiness
- [x] Allow advisory generation when a valid CoinGecko fallback quote exists despite a disconnected WebSocket
- [x] Label the Signals readiness badge with the actual quote source instead of showing waiting
- [x] Add regression coverage for fallback-backed advisory readiness


## Signal Push Stream Implementation
- [x] Add a server signal event stream with keepalive and disconnect cleanup
- [x] Publish newly persisted advisory signals to connected clients
- [x] Subscribe SignalFeed to push events while retaining polling fallback
- [x] Add deterministic event-stream unit coverage


## Production Hardening Audit
- [x] Verify paper order validation and lifecycle semantics for market and limit orders — unavailable until the persisted paper ledger is enabled
- [x] Verify paper positions and realized/unrealized P&L are backed by persisted records rather than UI-only state — empty until ledger persistence exists
- [x] Verify API-key placeholders never reach exchange requests or logs
- [x] Add operational audit visibility for order rejection and safety-gate outcomes


## Paper Execution Integrity
- [x] Remove hardcoded balance, random IDs, and fabricated FILLED/PENDING paper order responses
- [x] Return explicit unavailable/staged states until a persisted paper ledger exists
- [x] Return empty persisted trades and positions instead of mock records
- [x] Add regression tests proving paper endpoints never claim execution without ledger persistence


## Operational Audit Visibility
- [x] Add an audit_logs table for user-scoped safety and execution events
- [x] Persist live-order gate outcomes without storing secrets
- [x] Add a protected audit query for the Settings/Risk surface
- [x] Add unit coverage for audit event redaction and retrieval

## Paper Ledger Follow-up
- [x] Implement paper order modification for eligible open limit orders, with validation, persistence, UI controls, and tests
- [x] Expand paper trade history into a detailed execution log and render it with honest loading/empty/error states

## Documentation Milestone
- [x] Write the current architecture and data-flow guide
- [x] Write the user guide for paper trading, signals, copy plans, bots, and live-readiness gates
- [x] Write developer and environment setup guidance
- [x] Write deployment and troubleshooting guidance
- [x] Write dedicated database schema documentation covering current tables, key columns, relationships, indexes, and feature dependencies

## API Documentation Milestone
- [x] Document current tRPC procedure contracts and safety semantics

## Request Safety Hardening
- [x] Add bounded per-user throttling for live-order and advisory-generation procedures with deterministic tests

## Broker Adapter Boundary
- [x] Add typed Binance, Coinbase, and Kraken adapter contracts with disabled-by-default execution and deterministic capability tests
