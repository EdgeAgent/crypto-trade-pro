import { useEffect, useState } from "react";
import { createResilientWebSocketStream, type ResilientStreamStatus } from "@/lib/liveStream";

export interface LiveTradeTick {
  id: string;
  price: number;
  quantity: number;
  time: number;
  side: "BUY" | "SELL";
}

export function useLiveTradeStream(symbol: string) {
  const [trades, setTrades] = useState<LiveTradeTick[]>([]);
  const [status, setStatus] = useState<ResilientStreamStatus>("connecting");

  useEffect(() => {
    const stream = createResilientWebSocketStream({
      url: `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`,
      onStatus: setStatus,
      onData: (rawData) => {
        try {
          const payload = JSON.parse(rawData) as { t: number; p: string; q: string; T: number; m: boolean };
          const tick: LiveTradeTick = {
            id: String(payload.t),
            price: Number(payload.p),
            quantity: Number(payload.q),
            time: payload.T,
            side: payload.m ? "SELL" : "BUY",
          };
          if (!Number.isFinite(tick.price) || !Number.isFinite(tick.quantity)) return;
          setTrades((current) => [tick, ...current.filter((item) => item.id !== tick.id)].slice(0, 12));
        } catch {
          setStatus("offline");
        }
      },
    });

    return () => stream.close();
  }, [symbol]);

  return { trades, status };
}
