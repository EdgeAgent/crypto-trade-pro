import { useEffect, useState } from "react";
import { getOhlcDays, parseCoinGeckoOhlc, type ChartTimeframe, type OhlcCandle } from "@/lib/ohlc";

const coinGeckoIds: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", ADA: "cardano" };

export type OhlcStatus = "loading" | "live" | "offline" | "empty";

export function useLiveOhlc(symbol: string, timeframe: ChartTimeframe) {
  const [candles, setCandles] = useState<OhlcCandle[]>([]);
  const [status, setStatus] = useState<OhlcStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const coinId = coinGeckoIds[symbol.toUpperCase()];
    setCandles([]);
    setStatus("loading");
    setError(null);
    if (!coinId) {
      setStatus("offline");
      setError("No live OHLC provider mapping exists for this asset.");
      return () => { cancelled = true; };
    }

    const fetchOhlc = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${getOhlcDays(timeframe)}`);
        if (!response.ok) throw new Error(`OHLC request failed (${response.status})`);
        const parsed = parseCoinGeckoOhlc(await response.json());
        if (!cancelled) {
          setCandles(parsed);
          setStatus(parsed.length ? "live" : "empty");
          setError(parsed.length ? null : "The live provider returned no OHLC candles for this timeframe.");
        }
      } catch (requestError) {
        if (!cancelled) {
          setCandles([]);
          setStatus("offline");
          setError(requestError instanceof Error ? requestError.message : "Unable to load live OHLC data.");
        }
      }
    };

    void fetchOhlc();
    return () => { cancelled = true; };
  }, [symbol, timeframe]);

  return { candles, status, error };
}
