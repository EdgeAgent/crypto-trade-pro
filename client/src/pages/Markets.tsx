import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, TrendingDown, Search, WifiOff, ArrowUpRight, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  ath: number;
  atl: number;
}

export default function Markets() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"market_cap" | "price_change">("market_cap");

  const fetchCoins = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false", { signal });
      if (!response.ok) throw new Error(`Market feed returned ${response.status}`);
      const data = await response.json() as CoinData[];
      if (!Array.isArray(data)) throw new Error("Market feed returned an invalid payload");
      setCoins(data);
      setError("");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "The live market feed is unavailable.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchCoins(controller.signal);
    const interval = window.setInterval(() => void fetchCoins(controller.signal), 60000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);

  const filteredCoins = useMemo(() => coins.filter((coin) => `${coin.name} ${coin.symbol} ${coin.id}`.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => sortBy === "market_cap" ? (b.market_cap || 0) - (a.market_cap || 0) : (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity)), [coins, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><span className="status-dot bg-accent" /> Live market universe</div><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Markets</h1><p className="text-sm text-muted-foreground">Explore provider-backed prices, liquidity, and momentum without synthetic rows.</p></div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Card className="surface-glow mb-6 border-white/10 bg-card/75"><div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" placeholder="Search live assets by name, symbol, or ID" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="min-h-12 border-white/10 bg-background/60 pl-10" aria-label="Search live assets" /></div><label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-muted-foreground sm:min-w-56"><span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.13em]">Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as "market_cap" | "price_change")} className="min-w-0 flex-1 bg-transparent font-semibold text-foreground outline-none"><option value="market_cap">Market cap</option><option value="price_change">24h change</option></select></label></div></Card>

        {loading && coins.length === 0 ? <Card className="border-white/10 bg-card/70 p-12 text-center"><Spinner /><p className="mt-4 text-sm text-muted-foreground">Connecting to the live market feed…</p></Card> : error && coins.length === 0 ? <Card className="border-amber-500/20 bg-amber-500/[0.06] p-10 text-center"><WifiOff className="mx-auto h-6 w-6 text-amber-300" /><h2 className="mt-4 font-semibold text-foreground">Market feed unavailable</h2><p className="mt-2 text-sm text-muted-foreground">{error}</p><Button type="button" variant="outline" onClick={() => void fetchCoins()} className="mt-5 min-h-11 border-amber-500/20 bg-transparent text-amber-200"><RefreshCw className="mr-2 h-4 w-4" /> Retry live feed</Button></Card> : filteredCoins.length === 0 ? <Card className="border-white/10 bg-card/70 p-10 text-center"><Search className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-4 font-semibold text-foreground">No live asset matches this search</p><p className="mt-2 text-sm text-muted-foreground">Try a symbol such as BTC or a full coin name.</p></Card> : <div className="space-y-3">{error && <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200"><WifiOff className="h-4 w-4" /> Showing the last live snapshot while the feed reconnects: {error}</div>}{filteredCoins.map((coin) => { const change = coin.price_change_percentage_24h; const positive = (change ?? 0) >= 0; return <Card key={coin.id} className="interactive-lift border-white/10 bg-card/75 hover:border-accent/30"><div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1.8fr)_repeat(3,minmax(0,1fr))_auto] sm:items-center sm:p-5"><Link href={`/asset/${coin.id}`} className="flex min-w-0 items-center gap-3"><img src={coin.image} alt="" className="h-10 w-10 shrink-0 rounded-full" /><span className="min-w-0"><span className="block truncate font-semibold text-foreground">{coin.name}</span><span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">{coin.symbol}</span></span></Link><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Price</p><p className="mt-1 font-bold text-foreground">${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: coin.current_price < 1 ? 6 : 2 })}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">24h change</p><p className={`mt-1 flex items-center gap-1 font-semibold ${positive ? "text-green-400" : "text-red-400"}`}>{positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{change === null ? "Unavailable" : `${positive ? "+" : ""}${change.toFixed(2)}%`}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Volume</p><p className="mt-1 font-semibold text-foreground">${((coin.total_volume || 0) / 1e9).toFixed(2)}B</p></div><Link href={`/trading?symbol=${coin.symbol.toUpperCase()}`} className="touch-target inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90">Trade <ArrowUpRight className="h-4 w-4" /></Link></div></Card>; })}</div>}
      </main>
    </div>
  );
}
