import { useEffect, useReducer } from "react";
import { createResilientWebSocketStream, type ResilientStreamStatus } from "@/lib/liveStream";
import { initialLiveTickerState, parseBinanceTicker, reduceLiveTickerState, type LiveTickerState } from "@/lib/liveTicker";

const coinGeckoIds: Record<string, string> = { btcusdt: "bitcoin", ethusdt: "ethereum", adausdt: "cardano" };

export function useLiveTicker(symbol: string): LiveTickerState {
  const [state, dispatch] = useReducer(reduceLiveTickerState, initialLiveTickerState);

  useEffect(() => {
    let active = true;
    dispatch({ type: "reset" });
    const fetchFallback = async () => {
      const coinId = coinGeckoIds[symbol.toLowerCase()];
      if (!coinId) return;
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);
        if (!response.ok) throw new Error(`CoinGecko fallback returned ${response.status}`);
        const payload = await response.json() as { market_data?: { current_price?: { usd?: number }; price_change_percentage_24h?: number | null } };
        const price = Number(payload.market_data?.current_price?.usd);
        const change24h = Number(payload.market_data?.price_change_percentage_24h);
        if (active && Number.isFinite(price) && Number.isFinite(change24h)) dispatch({ type: "fallback-data", data: { price, change24h, eventTime: Date.now() } });
      } catch {
        if (active) dispatch({ type: "fallback-error" });
      }
    };

    void fetchFallback();
    const fallbackTimer = window.setInterval(fetchFallback, 30000);
    const stream = createResilientWebSocketStream({
      url: `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`,
      onStatus: (status: ResilientStreamStatus) => dispatch({ type: "transport-status", status }),
      onData: (rawData) => {
        try {
          const parsed = parseBinanceTicker(JSON.parse(rawData));
          if (parsed) dispatch({ type: "stream-data", data: parsed });
        } catch {
          dispatch({ type: "transport-status", status: "offline" });
        }
      },
    });

    return () => {
      active = false;
      window.clearInterval(fallbackTimer);
      stream.close();
    };
  }, [symbol]);

  return state;
}
