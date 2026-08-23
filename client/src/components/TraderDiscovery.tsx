import React, { useMemo, useState } from "react";
import { DollarSign, RefreshCw, Star, Users, Search, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export interface TraderProfile {
  id: string;
  name: string;
  avatar: string;
  strategy: string;
  winRate: number;
  monthlyReturn: number;
  followers: number;
  totalTrades: number;
  rating: number;
  badges: string[];
}

interface TraderDiscoveryProps {
  onFollow?: (trader: TraderProfile) => void;
  onCopy?: (trader: TraderProfile) => void;
}

export default function TraderDiscovery({ onFollow, onCopy }: TraderDiscoveryProps) {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"winRate" | "returns" | "followers">("winRate");
  const [following, setFollowing] = useState<string[]>([]);
  const tradersQuery = trpc.copyTrading.getTopTraders.useQuery(undefined, { enabled: isAuthenticated, retry: false, refetchInterval: 30000 });
  const traders = useMemo<TraderProfile[]>(() => (tradersQuery.data?.traders ?? []).map((trader) => ({ id: trader.id, name: trader.name, avatar: trader.name.slice(0, 2).toUpperCase(), strategy: trader.strategy, winRate: trader.winRate, monthlyReturn: trader.monthlyReturn, followers: trader.followers, totalTrades: trader.totalTrades, rating: trader.reputation, badges: [] })), [tradersQuery.data]);
  const filteredTraders = useMemo(() => traders.filter((trader) => `${trader.name} ${trader.strategy}`.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => sortBy === "winRate" ? b.winRate - a.winRate : sortBy === "returns" ? b.monthlyReturn - a.monthlyReturn : b.followers - a.followers), [searchQuery, sortBy, traders]);

  if (!isAuthenticated) return <Card className="border-dashed border-white/15 bg-card/70 p-8 text-center sm:p-10"><Users className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold text-foreground">Connect your account to discover live traders</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Trader discovery requires an authenticated account and a connected trader registry.</p></Card>;
  if (tradersQuery.isLoading) return <Card className="border-white/10 bg-card/70 p-10 text-center"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm text-muted-foreground">Loading live trader registry…</p></Card>;
  if (tradersQuery.isError) return <Card className="border-red-500/30 bg-red-500/[0.06] p-6"><h2 className="font-semibold text-red-300">Trader registry unavailable</h2><p className="mt-2 text-sm leading-6 text-red-200/80">{tradersQuery.error.message}</p><Button className="mt-4 min-h-11" variant="outline" onClick={() => tradersQuery.refetch()}>Retry registry</Button></Card>;

  return (
    <div className="space-y-6">
      <Card className="surface-glow border-white/10 bg-card/75 p-4 sm:p-5"><div className="flex flex-col gap-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search live traders or strategies" className="min-h-12 border-white/10 bg-background/60 pl-10" /></div><div className="grid grid-cols-3 gap-2" role="group" aria-label="Sort live traders">{(["winRate", "returns", "followers"] as const).map((sort) => <Button key={sort} type="button" onClick={() => setSortBy(sort)} className={`min-h-11 px-2 text-xs sm:text-sm ${sortBy === sort ? "bg-accent text-accent-foreground" : "border border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"}`}>{sort === "winRate" ? "Win rate" : sort === "returns" ? "Returns" : "Followers"}</Button>)}</div></div></Card>
      {filteredTraders.length === 0 ? <Card className="border-dashed border-white/15 bg-card/70 p-10 text-center"><Users className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold text-foreground">No live traders available</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{tradersQuery.data?.message ?? "The live trader registry returned no profiles."}</p></Card> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredTraders.map((trader) => { const isFollowing = following.includes(trader.id); return <Card key={trader.id} className="interactive-lift border-white/10 bg-card/75 hover:border-accent/30"><div className="flex h-full flex-col p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-lg font-bold text-accent">{trader.avatar}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-lg font-bold text-foreground">{trader.name}</h3><p className="truncate text-xs text-muted-foreground">{trader.strategy}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" /></div><div className="mt-2 flex items-center gap-1">{[0, 1, 2, 3, 4].map((index) => <Star key={index} className={`h-3 w-3 ${index < Math.floor(trader.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />)}<span className="ml-1 text-xs text-muted-foreground">{trader.rating}</span></div></div></div><div className="my-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-background/40 p-3"><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Win rate</p><p className="mt-1 font-bold text-green-400">{trader.winRate}%</p></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Return</p><p className="mt-1 font-bold text-green-400">+{trader.monthlyReturn}%</p></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Trades</p><p className="mt-1 font-bold text-foreground">{trader.totalTrades}</p></div></div><div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" />{trader.followers.toLocaleString()} followers</div><div className="mt-auto grid grid-cols-2 gap-2"><Button type="button" onClick={() => { setFollowing((current) => isFollowing ? current.filter((id) => id !== trader.id) : [...current, trader.id]); onFollow?.(trader); }} className={`min-h-11 ${isFollowing ? "bg-accent text-accent-foreground" : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1] hover:text-foreground"}`}>{isFollowing ? "Following" : "Follow"}</Button><Button type="button" onClick={() => onCopy?.(trader)} className="min-h-11 border border-accent/30 bg-accent/10 text-accent hover:bg-accent/15"><DollarSign className="mr-2 h-4 w-4" />Copy</Button></div></div></Card>; })}</div>}
      {traders.length > 0 && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Badge variant="outline" className="border-green-500/30 text-green-400">Live registry</Badge> Profiles and performance metrics are provider-backed.</div>}
    </div>
  );
}
