import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TraderDiscovery, { type TraderProfile } from "@/components/TraderDiscovery";
import CopyTradingDashboard, { type CopyPosition, type CopyHistoryRecord } from "@/components/CopyTradingDashboard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Traders() {
  const { isAuthenticated } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  const historyQuery = trpc.copyTrading.getCopyHistory.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const activeCopiesQuery = trpc.copyTrading.getActiveCopies.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const copyMutation = trpc.copyTrading.followTrader.useMutation({ onSuccess: (result) => { setNotice(result.message); void historyQuery.refetch(); }, onError: (error) => setNotice(error.message) });
  const stopMutation = trpc.copyTrading.unfollowTrader.useMutation({ onSuccess: () => { setNotice("Copy-trading intent stopped. No broker order was submitted."); void historyQuery.refetch(); }, onError: (error) => setNotice(error.message) });
  const copiedTraders = useMemo<TraderProfile[]>(() => (historyQuery.data?.history ?? []).filter((record) => record.status !== "stopped").map((record) => ({ id: record.trader.id, name: record.trader.name, avatar: record.trader.name.slice(0, 2).toUpperCase(), strategy: record.trader.strategy, winRate: record.trader.winRate, monthlyReturn: record.trader.monthlyReturn, followers: record.trader.followers, totalTrades: record.trader.totalTrades, rating: record.trader.reputation, badges: [] })), [historyQuery.data]);
  const positions = useMemo<CopyPosition[]>(() => (activeCopiesQuery.data?.copies ?? []).map((copy) => ({ traderId: copy.traderId, symbol: copy.symbol, side: copy.side, quantity: copy.quantity, pnl: copy.pnl })), [activeCopiesQuery.data]);
  const history = useMemo<CopyHistoryRecord[]>(() => (historyQuery.data?.history ?? []).map((record) => ({ id: record.id, traderId: record.traderId, traderName: record.trader.name, status: record.status, createdAt: record.createdAt })), [historyQuery.data]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/65 backdrop-blur-xl"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><span className="status-dot bg-accent" /> Copy desk</div><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Top traders</h1><p className="text-sm leading-6 text-muted-foreground">Discover, follow, and stage copy-trading plans without submitting real orders.</p></div></header>
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {notice && <Card role="status" className="border-accent/30 bg-accent/[0.06] p-4 text-sm leading-6 text-accent">{notice}</Card>}
        <TraderDiscovery onCopy={(trader) => copyMutation.mutate({ traderId: trader.id })} />
        {isAuthenticated && historyQuery.isLoading ? <Card className="border-white/10 bg-card/70 p-8 text-sm text-muted-foreground">Loading your persisted copy desk…</Card> : <CopyTradingDashboard copiedTraders={copiedTraders} positions={positions} history={history} activeCopiesLoading={activeCopiesQuery.isLoading} historyLoading={historyQuery.isLoading} activeCopiesError={activeCopiesQuery.error?.message} historyError={historyQuery.error?.message} onStopCopy={(traderId) => stopMutation.mutate({ traderId })} />}
        <Card className="border-white/10 bg-background/35"><div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-foreground">Copy trading safety</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Copy plans are persisted as intent until a verified broker, risk limit, and per-order confirmation are present.</p></div><Badge variant="outline" className="w-fit border-amber-500/40 text-amber-400">Execution gated</Badge></div></Card>
      </main>
    </div>
  );
}
