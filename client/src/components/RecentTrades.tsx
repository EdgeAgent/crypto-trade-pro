import React from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveTradeStream } from "@/hooks/useLiveTradeStream";

interface RecentTradesProps {
  symbol: string;
}

export default function RecentTrades({ symbol }: RecentTradesProps) {
  const { trades, status } = useLiveTradeStream(symbol);

  return (
    <Card className="border-border/50 bg-card">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent trades</h2>
            <p className="mt-1 text-sm text-muted-foreground">Live public trade tape for {symbol.toUpperCase()}</p>
          </div>
          <Badge variant="outline" className={status === "live" ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}>
            {status === "live" ? <><Wifi className="mr-1 h-3 w-3" /> Live</> : status === "connecting" ? "Connecting" : <><WifiOff className="mr-1 h-3 w-3" /> Offline</>}
          </Badge>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-border/50 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
          <span>Price</span><span>Size</span><span>Side</span><span>Time</span>
        </div>
        <div className="mt-2 space-y-1">
          {trades.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground"><Activity className="h-4 w-4" />{status === "offline" ? "Live trade tape unavailable" : "Waiting for live trades…"}</div>
          ) : trades.map((trade) => (
            <div key={trade.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 rounded px-2 py-2 text-sm hover:bg-muted/30">
              <span className="font-medium text-foreground">${trade.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
              <span className="text-muted-foreground">{trade.quantity.toFixed(6)}</span>
              <span className={trade.side === "BUY" ? "text-green-400" : "text-red-400"}>{trade.side}</span>
              <span className="text-xs text-muted-foreground">{new Date(trade.time).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
