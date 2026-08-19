import React from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveOrderBook, type LiveOrderBookLevel } from "@/hooks/useLiveOrderBook";

interface OrderBookProps {
  symbol: string;
}

function toStreamSymbol(symbol: string) {
  const normalized = symbol.replace("/", "").toLowerCase();
  return normalized.endsWith("usdt") ? normalized : `${normalized}usdt`;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const { bids, asks, status } = useLiveOrderBook(toStreamSymbol(symbol));
  const maxQuantity = Math.max(...bids.map((entry) => entry.quantity), ...asks.map((entry) => entry.quantity), 1);
  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  const spread = bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;
  const midPrice = bestBid !== null && bestAsk !== null ? (bestAsk + bestBid) / 2 : null;

  const renderOrderRow = (entry: LiveOrderBookLevel, isBid: boolean) => {
    const percentage = (entry.quantity / maxQuantity) * 100;
    const bgColor = isBid ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)";
    const textColor = isBid ? "text-green-400" : "text-red-400";

    return (
      <div
        key={`${entry.price}-${entry.quantity}`}
        className="relative h-8 flex items-center px-3 border-b border-border/30 hover:bg-muted/50 transition-colors"
        style={{
          background: `linear-gradient(to ${isBid ? "right" : "left"}, ${bgColor}, transparent)`,
          backgroundSize: `${percentage}% 100%`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: isBid ? "left" : "right",
        }}
      >
        <div className="flex justify-between w-full text-xs relative z-10">
          <span className={textColor}>${entry.price.toFixed(2)}</span>
          <span className="text-muted-foreground">{entry.quantity.toFixed(6)}</span>
          <span className="text-muted-foreground">${entry.total.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{symbol} Order Book</h3>
          <Badge variant="outline" className={status === "live" ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}>
            {status === "live" ? <><Wifi className="mr-1 h-3 w-3" /> Live</> : status === "connecting" ? "Connecting" : <><WifiOff className="mr-1 h-3 w-3" /> Offline</>}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-semibold text-green-400 mb-3 px-3">BIDS (Buy Orders)</div>
            <div className="space-y-0">{bids.length ? bids.map((bid) => renderOrderRow(bid, true)) : <div className="min-h-32 flex items-center justify-center text-sm text-muted-foreground">Waiting for bids…</div>}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-red-400 mb-3 px-3">ASKS (Sell Orders)</div>
            <div className="space-y-0">{asks.length ? asks.map((ask) => renderOrderRow(ask, false)) : <div className="min-h-32 flex items-center justify-center text-sm text-muted-foreground">Waiting for asks…</div>}</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Bid-Ask Spread:</span>
            <span className="font-semibold text-foreground">{spread === null ? "Unavailable" : `$${spread.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-muted-foreground">Mid Price:</span>
            <span className="font-semibold text-foreground">{midPrice === null ? "Unavailable" : `$${midPrice.toFixed(2)}`}</span>
          </div>
          {status === "offline" && <p className="mt-3 text-xs text-amber-400">Live depth stream unavailable; reconnecting with bounded backoff.</p>}
        </div>
      </div>
    </Card>
  );
}
