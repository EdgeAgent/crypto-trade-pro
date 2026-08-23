# Performance Baseline

This baseline measures the production client bundle after `pnpm build` using `node scripts/profile-build.mjs`. It is a static asset-size profile, not a claim about exchange latency or end-user runtime performance.

| Metric | Value |
|---|---:|
| Total uncompressed client assets | 1,644,019 bytes |
| Largest asset | `react-core` — 493,957 bytes |
| Chart vendor chunk | 391,620 bytes |
| Global CSS | 149,320 bytes |
| Trading route chunk | 95,849 bytes |
| Data vendor chunk | 84,512 bytes |

The application already uses route-level lazy loading and vendor chunk splitting. Future optimization should focus on chart vendor loading, route-level prefetch policy, image/media budgets, provider request frequency, and real-browser Web Vitals. Re-run the profiler after each production build and compare the generated `dist/profile.json` with this baseline.
