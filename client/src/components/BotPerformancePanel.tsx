import React from "react";
import { Activity, BarChart3, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface BotPerformanceMetrics {
  pnl: number;
  winRate: number;
  sharpe: number;
  maxDrawdown: number;
  tradeCount: number;
}

interface BotPerformancePanelProps {
  metrics?: BotPerformanceMetrics | null;
  executionConnected?: boolean;
}

export default function BotPerformancePanel({ metrics = null, executionConnected = false }: BotPerformancePanelProps) {
  const values = metrics ? [
    ["Realized P&L", `$${metrics.pnl.toFixed(2)}`],
    ["Win rate", `${metrics.winRate.toFixed(2)}%`],
    ["Sharpe ratio", metrics.sharpe.toFixed(2)],
    ["Max drawdown", `${metrics.maxDrawdown.toFixed(2)}%`],
  ] : [];
  return <Card className="surface-glow border-white/10 bg-card/80"><div className="p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" /><h2 className="text-lg font-semibold text-foreground">Bot performance</h2></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Execution metrics are calculated from recorded bot fills, not strategy assumptions.</p></div><Badge variant="outline" className={executionConnected ? "w-fit border-green-500/40 text-green-400" : "w-fit border-amber-500/40 text-amber-400"}>{executionConnected ? "Execution linked" : "Awaiting execution data"}</Badge></div>{metrics && executionConnected ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{values.map(([label, value]) => <div key={label} className="rounded-2xl border border-white/5 bg-background/40 p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold text-foreground">{value}</p></div>)}<div className="col-span-2 rounded-2xl border border-white/5 bg-background/40 p-4 sm:col-span-4"><p className="text-xs text-muted-foreground">Recorded bot trades</p><p className="mt-1 text-lg font-semibold text-foreground">{metrics.tradeCount}</p></div></div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-background/30 p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /><div><p className="font-medium text-foreground">No bot execution history yet</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{executionConnected ? "The execution provider has not reported any bot fills." : "Connect a verified broker and execution log provider to calculate P&L, win rate, Sharpe, and drawdown."}</p></div></div></div>}<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5" />Metrics remain unavailable until fills are recorded.</div></div></Card>;
}
