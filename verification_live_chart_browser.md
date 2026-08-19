# Live Chart Browser Verification

Captured on 2026-08-19 in the real browser session at `/trading` after the initial connecting state settled.

The page-level extraction showed `BTC/USDT`, `Live OHLC`, a live price of `$69,342.01`, `+7.18%`, and timeframe controls `1H`, `4H`, `1D`, `1W`. The indicator controls were present and enabled for `RSI`, `MACD`, and `Bollinger Bands`. The rendered chart content included the provider-backed time axis (`Jul 25, 8:00 AM`, `Aug 5, 4:00 AM`, `Aug 19, 8:00 PM`) and formatted price-axis ticks (`$61,930`, `$63,930`, `$65,930`, `$69,327`). The live OHLC stats showed High `$68,982`, Low `$62,241`, Change `+7.18%`, and Current `$69,342.01`.

The indicator sections were visible with `RSI (14)` and `MACD (12, 26, 9)` headings, and the page-level screenshot showed non-empty RSI and MACD paths. The page content also reported `Bollinger Bands enabled`. The order book showed live bid/ask levels and a `$0.01` spread, while the recent trades panel showed live BTCUSDT trade rows. This is browser evidence that the explicit chart-parent heights and valid ComposedChart MACD configuration render live chart and indicator content after async data resolution.
