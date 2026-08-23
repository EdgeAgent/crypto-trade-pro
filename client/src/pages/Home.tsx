import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, Loader2, Plus, Radio, Sparkles, TrendingDown, TrendingUp, WifiOff } from "lucide-react";
import { Link } from "wouter";
import PortfolioHoldings from "@/components/PortfolioHoldings";
import Watchlist from "@/components/Watchlist";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  total_volume: number;
  image: string;
}

export default function Home() {
  const { user } = useAuth();
  const [topCoins, setTopCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchTopCoins = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=false", { signal: controller.signal });
        if (!response.ok) throw new Error(`Market feed returned ${response.status}`);
        const data = await response.json() as CoinData[];
        if (!Array.isArray(data)) throw new Error("Market feed returned an invalid payload");
        setTopCoins(data);
        setFeedError("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFeedError(error instanceof Error ? error.message : "The live market feed is unavailable.");
      } finally {
        setLoading(false);
      }
    };
    void fetchTopCoins();
    const interval = window.setInterval(() => void fetchTopCoins(), 60000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);

  const gainers = topCoins.filter((coin) => (coin.price_change_percentage_24h ?? 0) >= 0).length;
  const losers = topCoins.length - gainers;
  const strongestMove = topCoins.reduce<CoinData | null>((current, coin) => !current || Math.abs(coin.price_change_percentage_24h ?? 0) > Math.abs(current.price_change_percentage_24h ?? 0) ? coin : current, null);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-8 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><span className="status-dot bg-accent" /> Live market command center</div>
            <h1 className="max-w-2xl text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">Trade with signal.<br /><span className="bg-gradient-to-r from-accent via-cyan-200 to-violet-300 bg-clip-text text-transparent">Not noise.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Welcome back, {user?.name || "Trader"}. Follow the live tape, pressure-test a strategy, and keep every execution behind explicit risk gates.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild variant="outline" className="touch-target min-h-11 w-full border-white/10 bg-white/[0.03] sm:w-auto"><Link href="/markets"><Eye className="mr-2 h-4 w-4" /> Explore markets</Link></Button>
            <Button asChild className="touch-target min-h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"><Link href="/trading"><Plus className="mr-2 h-4 w-4" /> Open workspace</Link></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          <Card className="surface-glow relative overflow-hidden border-accent/20 bg-gradient-to-br from-accent/[0.13] via-card/90 to-violet-500/[0.08]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative flex min-h-[210px] flex-col justify-between gap-8 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">The edge is information</p><h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Your market pulse, in one clean view.</h2></div><Sparkles className="h-6 w-6 shrink-0 text-accent" /></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Feed status</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-accent"><Radio className="h-3.5 w-3.5" /> {loading ? "Connecting" : feedError ? "Offline" : "Live"}</p></div>
                <div className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Assets tracked</p><p className="mt-1 text-lg font-bold text-foreground">{loading ? "—" : topCoins.length}</p></div>
                <div className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Gainers</p><p className="mt-1 text-lg font-bold text-green-400">{loading ? "—" : gainers}</p></div>
                <div className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Losers</p><p className="mt-1 text-lg font-bold text-red-400">{loading ? "—" : losers}</p></div>
              </div>
            </div>
          </Card>
          <Card className="border-white/10 bg-card/75">
            <div className="flex h-full flex-col justify-between gap-6 p-5 sm:p-7"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account mode</p><div className="mt-3 flex items-center gap-3"><span className="status-dot bg-accent" /><span className="text-xl font-bold text-accent">PAPER</span><span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">Safety gated</span></div><p className="mt-3 text-sm leading-6 text-muted-foreground">No invented balances. Connect a broker and complete risk controls before real execution is available.</p></div><Link href="/settings" className="touch-target inline-flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-foreground hover:border-accent/30 hover:text-accent">Review readiness <ArrowRight className="h-4 w-4" /></Link></div>
          </Card>
        </section>

        <section className="space-y-4"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Market pulse</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Top assets now</h2></div><Link href="/markets" className="hidden items-center gap-1 text-sm font-semibold text-accent hover:text-accent/80 sm:flex">View all <ArrowRight className="h-4 w-4" /></Link></div>
          {loading ? <Card className="border-white/10 bg-card/70 p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm text-muted-foreground">Connecting to the live market feed…</p></Card> : feedError ? <Card className="border-amber-500/20 bg-amber-500/[0.06] p-8 text-center"><WifiOff className="mx-auto h-6 w-6 text-amber-300" /><p className="mt-3 font-semibold text-foreground">Market feed unavailable</p><p className="mt-1 text-sm text-muted-foreground">{feedError}</p></Card> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">{topCoins.map((coin) => { const change = coin.price_change_percentage_24h ?? 0; return <Link key={coin.id} href={`/asset/${coin.id}`} className="interactive-lift rounded-2xl border border-white/10 bg-card/75 p-4 hover:border-accent/30"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><img src={coin.image} alt="" className="h-9 w-9 shrink-0 rounded-full" /><div className="min-w-0"><p className="truncate text-sm font-bold text-foreground">{coin.symbol.toUpperCase()}</p><p className="truncate text-xs text-muted-foreground">{coin.name}</p></div></div><span className={`rounded-full p-1.5 ${change >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}</span></div><p className="mt-5 text-xl font-bold text-foreground">${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: coin.current_price < 1 ? 6 : 2 })}</p><p className={`mt-1 text-sm font-semibold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</p></Link>; })}</div>}
          {strongestMove && !loading && !feedError && <p className="text-xs text-muted-foreground">Largest 24h move in this view: <span className="font-semibold text-foreground">{strongestMove.symbol.toUpperCase()}</span> at {strongestMove.price_change_percentage_24h === null ? "unavailable" : `${strongestMove.price_change_percentage_24h >= 0 ? "+" : ""}${strongestMove.price_change_percentage_24h.toFixed(2)}%`}.</p>}
        </section>

        <section className="space-y-10"><div><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Account surface</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Portfolio holdings</h2></div></div><PortfolioHoldings /></div><div><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Personal signal board</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Watchlist</h2></div></div><Watchlist /></div></section>
      </main>
    </div>
  );
}
