import React from "react";
import { Activity, Copy, History, ShieldCheck, Users, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TraderProfile } from "@/components/TraderDiscovery";

export interface CopyPosition {
  traderId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  pnl: number;
}

export interface CopyPerformance {
  realizedPnl: number;
  unrealizedPnl: number;
  copiedTradeCount: number;
}

export interface CopyHistoryRecord {
  id: string;
  traderId: string;
  traderName: string;
  status: string;
  createdAt: Date | string;
}

interface CopyTradingDashboardProps {
  copiedTraders: TraderProfile[];
  positions?: CopyPosition[];
  performance?: CopyPerformance | null;
  history?: CopyHistoryRecord[];
  activeCopiesLoading?: boolean;
  historyLoading?: boolean;
  activeCopiesError?: string;
  historyError?: string;
  onStopCopy: (traderId: string) => void;
}

export default function CopyTradingDashboard({ copiedTraders, positions = [], performance = null, history = [], activeCopiesLoading = false, historyLoading = false, activeCopiesError, historyError, onStopCopy }: CopyTradingDashboardProps) {
  const hasBrokerData = positions.length > 0 || performance !== null;
  return (
    <Card className="surface-glow border-white/10 bg-card/80">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold text-foreground">Copy trading dashboard</h2><Badge variant="outline" className="border-amber-500/40 text-amber-400">Persisted plans</Badge></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Manage trader-following intent. Broker-linked positions and P&amp;L appear only after a verified execution account is connected.</p></div><Copy className="h-6 w-6 shrink-0 text-accent" /></div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/5 bg-background/40 p-4"><Users className="h-4 w-4 text-accent" /><p className="mt-2 text-xs text-muted-foreground">Staged traders</p><p className="mt-1 text-lg font-bold text-foreground">{copiedTraders.length}</p></div><div className="rounded-2xl border border-white/5 bg-background/40 p-4"><WalletCards className="h-4 w-4 text-accent" /><p className="mt-2 text-xs text-muted-foreground">Active copied positions</p><p className="mt-1 text-lg font-bold text-foreground">{activeCopiesLoading ? "Loading" : hasBrokerData ? positions.length : "Unavailable"}</p></div><div className="rounded-2xl border border-white/5 bg-background/40 p-4"><ShieldCheck className="h-4 w-4 text-accent" /><p className="mt-2 text-xs text-muted-foreground">Copy performance</p><p className="mt-1 text-lg font-bold text-foreground">{performance ? `$${performance.realizedPnl.toFixed(2)}` : "Unavailable"}</p></div></div>

        {copiedTraders.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-8 text-center"><p className="font-medium text-foreground">No staged copy plans yet</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Use Copy on a trader card to stage a plan. It will not submit orders while execution is gated.</p></div> : <div className="mt-5 space-y-3">{copiedTraders.map((trader) => <div key={trader.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-background/35 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold text-foreground">{trader.name}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{trader.winRate}% win rate · +{trader.monthlyReturn}% monthly return · {trader.followers.toLocaleString()} followers</p></div><div className="flex items-center gap-3"><Badge variant="outline" className="border-amber-500/40 text-amber-400">Awaiting broker</Badge><Button variant="outline" className="min-h-11" onClick={() => onStopCopy(trader.id)}>Remove</Button></div></div>)}</div>}

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2"><section><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-accent" /><h3 className="font-semibold text-foreground">Active copied positions</h3></div>{activeCopiesError ? <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-sm leading-6 text-red-200">{activeCopiesError}</div> : activeCopiesLoading ? <div className="mt-3 rounded-xl border border-white/10 p-5 text-sm text-muted-foreground">Loading broker-linked positions…</div> : positions.length === 0 ? <div className="mt-3 rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-muted-foreground">No broker-linked copied positions are available. This is intentional until a verified execution account reports positions.</div> : <div className="mt-3 space-y-2">{positions.map((position) => <div key={`${position.traderId}-${position.symbol}`} className="rounded-xl border border-white/10 bg-background/35 p-4"><div className="flex items-center justify-between gap-3"><span className="font-semibold text-foreground">{position.symbol || "Symbol unavailable"}</span><Badge variant="outline">{position.side}</Badge></div><p className="mt-2 text-sm text-muted-foreground">Quantity {position.quantity || "Unavailable"} · P&amp;L {position.pnl === 0 ? "Unavailable" : `$${position.pnl.toFixed(2)}`}</p></div>)}</div>}</section><section><div className="flex items-center gap-2"><History className="h-4 w-4 text-accent" /><h3 className="font-semibold text-foreground">Persisted intent history</h3></div>{historyError ? <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-sm leading-6 text-red-200">{historyError}</div> : historyLoading ? <div className="mt-3 rounded-xl border border-white/10 p-5 text-sm text-muted-foreground">Loading persisted history…</div> : history.length === 0 ? <div className="mt-3 rounded-xl border border-dashed border-white/15 p-5 text-sm leading-6 text-muted-foreground">No persisted copy intents yet. Broker-linked trade history will appear separately when execution is connected.</div> : <div className="mt-3 space-y-2">{history.map((record) => <div key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-background/35 p-4"><div className="min-w-0"><p className="truncate font-medium text-foreground">{record.traderName}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleString()}</p></div><Badge variant="outline" className="shrink-0">{record.status}</Badge></div>)}</div>}</section></div>
        {!hasBrokerData && <p className="mt-6 text-xs leading-5 text-muted-foreground">No broker-linked position or performance data is available. This empty state is intentional and avoids inventing copied-trade results.</p>}
      </div>
    </Card>
  );
}
