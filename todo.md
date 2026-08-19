# CryptoTrade Pro - Enterprise Trading Platform TODO

## Phase 1: Core Dashboard & Live Data ✅
- [x] Dark theme with cyan accents
- [x] Portfolio tracking with $1000 starting balance
- [x] Live crypto data from CoinGecko API
- [x] Top cryptocurrencies display
- [x] Markets page with search and sorting
- [x] Trading page with order placement UI

## Phase 2: Advanced UI & Professional Interface
- [x] Interactive candlestick charts with Recharts
- [x] Multiple timeframe selector (1H, 4H, 1D, 1W)
- [ ] Technical indicators (RSI, MACD, Bollinger Bands)
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
- [ ] Active copies dashboard
- [ ] Copy trade history and performance tracking
- [ ] Follower/reputation system — pending persistent trader registry
- [ ] Trader signal publishing
- [ ] Signal feed with real-time updates

## Phase 4: AI Signal Generation (from Gemini Agent)
- [ ] LunarCrush API integration for social sentiment
- [ ] Google Gemini AI signal generation
- [ ] Inngest background job orchestration
- [ ] Real-time progress tracking UI
- [ ] Trading signals database
- [ ] Confidence score display
- [ ] Signal reasoning/explanation
- [ ] Discord alert notifications
- [ ] Signal performance tracking

## Phase 5: Paper Trading Engine
- [ ] Market order execution
- [ ] Limit order execution
- [ ] Stop-loss orders
- [ ] Take-profit orders
- [ ] Order modification and cancellation
- [ ] Position tracking
- [ ] P&L calculations (realized and unrealized)
- [ ] Trade history with detailed logs
- [ ] Order status updates

## Phase 6: Strategy Bot Deployment
- [x] Bot creation UI
- [x] Strategy parameter configuration
- [x] Bot status management (active/paused/stopped)
- [ ] Backtesting framework
- [ ] Performance metrics dashboard
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
- [ ] Frontend code splitting
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
- [ ] Mobile responsiveness testing
- [ ] Browser compatibility testing
- [ ] Performance profiling

## Phase 12: Documentation & Deployment
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide
- [ ] Deployment guide
- [ ] Architecture documentation
- [ ] Database schema documentation
- [ ] Environment setup guide
- [ ] Troubleshooting guide

## Database Schema Extensions
- [ ] traders table
- [ ] copy_trades table
- [ ] trading_signals table
- [ ] trading_bots table
- [ ] social_sentiment table
- [ ] bot_performance table
- [ ] price_alerts table
- [ ] audit_logs table

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
- [x] Advanced Charts
- [x] Order Book component
- [x] GO LIVE Switch toggle
- [x] Risk Dashboard
- [ ] Performance Analytics
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
