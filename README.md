# Edge Atlas

<p align="center">
  <img src="https://3000-icmi3a5h53sj5xs1enntu-28431de7.us3.manus.computer/manus-storage/edge-atlas-github-banner_eeb77c8e.png" alt="Edge Atlas — repository of repositories" width="1200" />
</p>

<p align="center">
  <strong>A repository of repositories.</strong><br />
  A source-linked workspace for projects, frameworks, and AI prompt skills—with focused detail pages and honest metadata.
</p>

<p align="center">
  <a href="https://github.com/EdgeAgent/crypto-trade-pro/actions"><img src="https://img.shields.io/github/actions/workflow/status/EdgeAgent/crypto-trade-pro/ci.yml?label=build" alt="Build status" /></a>
  <a href="https://github.com/EdgeAgent/crypto-trade-pro"><img src="https://img.shields.io/github/last-commit/EdgeAgent/crypto-trade-pro?label=updated" alt="Last commit" /></a>
  <img src="https://img.shields.io/badge/tests-59%20passing-18d9c5" alt="59 tests passing" />
  <img src="https://img.shields.io/badge/React%2019-%2300d4ff" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-%233178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-7c5cff" alt="MIT license" />
</p>

> **Safety first:** paper mode is the default. Live order execution remains disabled until a broker connection is independently configured, validated, reconciled, and explicitly confirmed for each order.

## Product preview

<p align="center">
  <img src="https://3000-icmi3a5h53sj5xs1enntu-28431de7.us3.manus.computer/manus-storage/edge-atlas-dashboard-preview_b51a6357.png" alt="Edge Atlas repository catalog preview" width="1100" />
</p>

## What this is

Edge Atlas is a calm, source-linked index for the work behind the work: your projects, AI frameworks, prompt skills, automations, and experiments. The app presents one unified repository view plus focused shelves and detail pages that always link back to the originating GitHub repository.

The catalog is intentionally designed to show **known, missing, private, or source-pending** metadata rather than inventing stars, rankings, quality scores, adoption, or project status. The existing CryptoTrade Pro trading workspace remains available as one project in the collection, not as the identity of this repository.

## Product surface

| Surface | Current behavior |
| --- | --- |
| All Repositories | Unified source-linked index across the current GitHub snapshot |
| Projects | Searchable project shelf with public/private visibility states and source links |
| Frameworks | Framework, runtime, protocol, and automation shelf with honest metadata |
| Prompt Skills | Prompt and workflow shelf, including a source-backed 10,170-item vault claim |
| Repository detail | Focused source record with owner, visibility, snapshot date, description, and GitHub link |
| CryptoTrade Pro | Existing trading workspace remains available as a separate project route |

## Technology

React 19, TypeScript, Tailwind CSS 4, tRPC 11, Express, Drizzle ORM, MySQL/TiDB, Recharts, Vitest, CoinGecko REST, Binance WebSocket, and the configured server-side LLM proxy.

## Quick start

```bash
pnpm install
pnpm dev
```

For verification:

```bash
pnpm check
pnpm test
pnpm build
node scripts/profile-build.mjs
```

The complete setup, architecture, API, schema, deployment, and troubleshooting references are in [`docs/`](docs/).

## Repository notes

This public repository contains the Edge Atlas catalog experience and project documentation. Catalog entries are a dated GitHub snapshot; they are not an automatic mirror of every repository, Project board, or GitHub Pages site. The collection does not fabricate missing metadata or claim that every listed project is production-ready.

## Documentation

- [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md)
- [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md)
- [`docs/API.md`](docs/API.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md)
- [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md)
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)
- [`docs/PERFORMANCE_BASELINE.md`](docs/PERFORMANCE_BASELINE.md)

## Status

The current project snapshot is focused on cataloging and navigating the Edge Atlas repository collection. The original CryptoTrade Pro trading workspace remains production-hardened for provider-backed observation, honest paper execution, advisory signal delivery, and safety-gated readiness; real Binance, Coinbase, and Kraken execution adapters remain typed and disabled by default.
