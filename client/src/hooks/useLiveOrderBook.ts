import { useEffect, useState } from "react";
import { createResilientWebSocketStream, type ResilientStreamStatus } from "@/lib/liveStream";

export interface LiveOrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export function useLiveOrderBook(symbol: string) {
  const [bids, setBids] = useState<LiveOrderBookLevel[]>([]);
  const [asks, setAsks] = useState<LiveOrderBookLevel[]>([]);
  const [status, setStatus] = useState<ResilientStreamStatus>("connecting");

  useEffect(() => {
    const stream = createResilientWebSocketStream({
      url: `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth5@100ms`,
      onStatus: setStatus,
      onData: (rawData) => {
        try {
          const payload = JSON.parse(rawData) as { bids: [string, string][]; asks: [string, string][] };
          const parseLevels = (levels: [string, string][]) => levels.map(([price, quantity]) => {
            const parsedPrice = Number(price);
            const parsedQuantity = Number(quantity);
            return { price: parsedPrice, quantity: parsedQuantity, total: parsedPrice * parsedQuantity };
          }).filter((level) => Number.isFinite(level.price) && Number.isFinite(level.quantity));
          setBids(parseLevels(payload.bids ?? []));
          setAsks(parseLevels(payload.asks ?? []));
        } catch {
          setStatus("offline");
        }
      },
    });

    return () => stream.close();
  }, [symbol]);

  return { bids, asks, status };
}
