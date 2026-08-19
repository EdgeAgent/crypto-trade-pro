import React, { useMemo, useState } from "react";
import { DollarSign, RefreshCw, Star, Users } from "lucide-react";
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
  const filteredTraders = useMemo(() => traders.filter((trader) => trader.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => sortBy === "winRate" ? b.winRate - a.winRate : sortBy === "returns" ? b.monthlyReturn - a.monthlyReturn : b.followers - a.followers), [searchQuery, sortBy, traders]);

  if (!isAuthenticated) return <Card className="border-dashed border-border bg-card p-10 text-center"><h2 className="text-lg font-semibold text-foreground">Connect your account to discover live traders</h2><p className="mt-2 text-sm text-muted-foreground">Trader discovery requires an authenticated account and a connected trader registry.</p></Card>;
  if (tradersQuery.isLoading) return <Card className="border-border/50 bg-card p-10 text-center"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm text-muted-foreground">Loading live trader registry…</p></Card>;
  if (tradersQuery.isError) return <Card className="border-red-500/30 bg-red-500/5 p-6"><h2 className="font-semibold text-red-300">Trader registry unavailable</h2><p className="mt-2 text-sm text-red-200/80">{tradersQuery.error.message}</p><Button className="mt-4" variant="outline" onClick={() => tradersQuery.refetch()}>Retry</Button></Card>;

  return (
    <div>
      <Card className="bg-card border-border/50 p-6 mb-8"><div className="flex flex-col sm:flex-row gap-4"><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search live traders…" className="flex-1 bg-muted border-border" /><div className="flex gap-2">{(["winRate", "returns", "followers"] as const).map((sort) => <Button key={sort} onClick={() => setSortBy(sort)} className={sortBy === sort ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}>{sort === "winRate" ? "Win Rate" : sort === "returns" ? "Returns" : "Followers"}</Button>)}</div></div></Card>
      {filteredTraders.length === 0 ? <Card className="border-dashed border-border bg-card p-12 text-center"><Users className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold text-foreground">No live traders available</h2><p className="mt-2 text-sm text-muted-foreground">{tradersQuery.data?.message ?? "The live trader registry returned no profiles."}</p></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredTraders.map((trader) => { const isFollowing = following.includes(trader.id); return <Card key={trader.id} className="bg-card border-border/50 hover:border-accent/50 transition-all"><div className="p-6"><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center"><span className="font-bold text-accent text-lg">{trader.avatar}</span></div><div><h3 className="font-bold text-foreground text-lg">{trader.name}</h3><p className="text-xs text-muted-foreground">{trader.strategy}</p><div className="flex items-center gap-1">{[0, 1, 2, 3, 4].map((index) => <Star key={index} className={`w-3 h-3 ${index < Math.floor(trader.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />)}<span className="text-xs text-muted-foreground ml-1">{trader.rating}</span></div></div></div><div className="space-y-3 mb-4 p-3 bg-muted/30 rounded-lg"><div className="flex justify-between"><span className="text-sm text-muted-foreground">Win Rate</span><span className="font-bold text-green-400">{trader.winRate}%</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Monthly Return</span><span className="font-bold text-green-400">+{trader.monthlyReturn}%</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Trades</span><span className="font-bold text-foreground">{trader.totalTrades}</span></div></div><div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground"><Users className="w-4 h-4" />{trader.followers.toLocaleString()} followers</div><div className="flex gap-2"><Button onClick={() => { setFollowing((current) => isFollowing ? current.filter((id) => id !== trader.id) : [...current, trader.id]); onFollow?.(trader); }} className={`flex-1 ${isFollowing ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{isFollowing ? "Following" : "Follow"}</Button><Button onClick={() => onCopy?.(trader)} className="flex-1 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30"><DollarSign className="w-4 h-4 mr-2" />Copy</Button></div></div></Card>; })}</div>}
    </div>
  );
}
