import React from "react";
import { Copy, ShieldCheck, Users, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TraderProfile } from "@/components/TraderDiscovery";

export interface CopyPosition {
  traderId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  unrealizedPnl: number;
}

export interface CopyPerformance {
  realizedPnl: number;
  unrealizedPnl: number;
  copiedTradeCount: number;
}

interface CopyTradingDashboardProps {
  copiedTraders: TraderProfile[];
  positions?: CopyPosition[];
  performance?: CopyPerformance | null;
  onStopCopy: (traderId: string) => void;
}

export default function CopyTradingDashboard({ copiedTraders, positions = [], performance = null, onStopCopy }: CopyTradingDashboardProps) {
  const hasBrokerData = positions.length > 0 || performance !== null;
  return (
    <Card className="border-border/50 bg-card">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-xl font-bold text-foreground">Copy trading dashboard</h2><Badge variant="outline" className="border-amber-500/40 text-amber-400">Staged plans</Badge></div><p className="mt-1 text-sm text-muted-foreground">Manage trader-following intent. Broker-linked positions and P&amp;L appear only after a verified execution account is connected.</p></div><Copy className="h-6 w-6 text-accent" /></div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3"><div className="rounded-lg border border-border/50 bg-muted/20 p-4"><Users className="h-4 w-4 text-accent" /><p className="mt-2 text-xs text-muted-foreground">Staged traders</p><p className="mt-1 text-lg font-bold text-foreground">{copiedTraders.length}</p></div><div className="rounded-lg border border-border/50 bg-muted/20 p-4"><WalletCards className="h-4 w-4 text-accent" /><p className="mt-2 text-xs text-muted-foreground">Broker-linked positions</p><p className="mt-1 text-lg font-bold text-foreground">{hasBrokerData ? positions.length : "Unavailable"}</p></div><div className="rounded-lg border border-border/50 bg-muted/20 p-4"><ShieldCheck className="h-4 w-4 text-accent" /><p className="mt-2 text-xs text-muted-foreground">Copy performance</p><p className="mt-1 text-lg font-bold text-foreground">{performance ? `$${performance.realizedPnl.toFixed(2)}` : "Unavailable"}</p></div></div>

        {copiedTraders.length === 0 ? <div className="mt-5 rounded-lg border border-dashed border-border p-8 text-center"><p className="font-medium text-foreground">No staged copy plans yet</p><p className="mt-1 text-sm text-muted-foreground">Use Copy on a trader card to stage a plan. It will not submit orders while execution is gated.</p></div> : <div className="mt-5 space-y-3">{copiedTraders.map((trader) => <div key={trader.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/20 p-4"><div><p className="font-semibold text-foreground">{trader.name}</p><p className="mt-1 text-sm text-muted-foreground">{trader.winRate}% win rate · +{trader.monthlyReturn}% monthly return · {trader.followers.toLocaleString()} followers</p></div><div className="flex items-center gap-3"><Badge variant="outline" className="border-amber-500/40 text-amber-400">Awaiting broker</Badge><Button variant="outline" size="sm" onClick={() => onStopCopy(trader.id)}>Remove</Button></div></div>)}</div>}
        {!hasBrokerData && <p className="mt-5 text-xs text-muted-foreground">No broker-linked position or performance data is available. This empty state is intentional and avoids inventing copied-trade results.</p>}
      </div>
    </Card>
  );
}
