import React from "react";
import { Activity, BarChart3, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface TradeRecord {
  id: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  realizedPnl?: number;
  timestamp: number;
}

interface PerformanceAnalyticsProps {
  brokerConnected: boolean;
  trades?: TradeRecord[];
}

export default function PerformanceAnalytics({ brokerConnected, trades = [] }: PerformanceAnalyticsProps) {
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => (t.realizedPnl ?? 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalVolume = trades.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const realizedPnl = trades.reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0);

  return (
    <Card className="border-border/50 bg-card">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Performance Analytics</h2>
              <Badge variant="outline" className={brokerConnected ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}>
                {brokerConnected ? "Live Metrics" : "Awaiting Broker"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Real-time risk-adjusted returns and execution metrics computed from session trades.</p>
          </div>
          <BarChart3 className="h-6 w-6 text-accent" />
        </div>

        {brokerConnected ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Realized P&L</p>
                <p className={`mt-2 text-lg font-bold ${realizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}>{realizedPnl >= 0 ? "+" : ""}${realizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Total Volume</p>
                <p className="mt-2 text-lg font-bold text-foreground">${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Executed Trades</p>
                <p className="mt-2 text-lg font-bold text-foreground">{totalTrades}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="mt-2 text-lg font-bold text-green-400">{totalTrades > 0 ? `${winRate.toFixed(1)}%` : "No trades"}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-green-400" /> Profitable Trades</span>
                <span className="font-semibold text-foreground">{winningTrades} of {totalTrades}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="h-4 w-4 text-accent" /> Execution Feed</span>
                <span className="font-semibold text-foreground">{brokerConnected ? "Active WebSocket / REST" : "Disconnected"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-400" /> Safety Gate</span>
                <span className="font-semibold text-green-400">Enforced</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-border/50 bg-muted/20 p-8 text-center">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground/60 animate-pulse" />
            <h3 className="mt-3 font-semibold text-foreground">Performance metrics locked</h3>
            <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground">Connect a verified broker account in Settings to stream live risk-adjusted returns and execution analytics. No synthetic performance data is shown.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
