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
    <Card className="surface-glow border-white/10 bg-card/80">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Market tape</p><h2 className="mt-1 text-lg font-bold text-foreground">Recent trades</h2><p className="mt-1 truncate text-sm text-muted-foreground">Live public trade tape for {symbol.toUpperCase()}</p></div>
          <Badge variant="outline" className={status === "live" ? "shrink-0 border-green-500/40 text-green-400" : "shrink-0 border-amber-500/40 text-amber-400"}>{status === "live" ? <><Wifi className="mr-1 h-3 w-3" /> Live</> : status === "connecting" ? "Connecting" : <><WifiOff className="mr-1 h-3 w-3" /> Offline</>}</Badge>
        </div>

        <div className="mt-5 hidden grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-white/10 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:grid"><span>Price</span><span>Size</span><span>Side</span><span>Time</span></div>
        <div className="mt-3 space-y-1">
          {trades.length === 0 ? <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground"><Activity className="h-4 w-4" />{status === "offline" ? "Live trade tape unavailable" : "Waiting for live trades…"}</div> : trades.map((trade) => <div key={trade.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 rounded-xl border border-transparent px-3 py-3 text-sm hover:border-white/5 hover:bg-white/[0.025] sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-3 sm:rounded sm:border-0 sm:px-2 sm:py-2"><div><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:hidden">Price</span><span className="font-medium text-foreground">${trade.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span></div><div className="text-right sm:text-left"><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:hidden">Size</span><span className="text-muted-foreground">{trade.quantity.toFixed(6)}</span></div><div><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:hidden">Side</span><span className={trade.side === "BUY" ? "text-green-400" : "text-red-400"}>{trade.side}</span></div><div className="text-right"><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:hidden">Time</span><span className="text-xs text-muted-foreground">{new Date(trade.time).toLocaleTimeString()}</span></div></div>)}
        </div>
      </div>
    </Card>
  );
}
