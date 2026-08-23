import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Trash2, TrendingDown, TrendingUp, WifiOff } from "lucide-react";

interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  total_volume: number;
}

interface WatchlistItem extends MarketCoin {}

export default function Watchlist() {
  const [marketCoins, setMarketCoins] = useState<MarketCoin[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadMarkets = async () => {
      try {
        setStatus("loading");
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false", { signal: controller.signal });
        if (!response.ok) throw new Error(`Market feed returned ${response.status}`);
        const data = await response.json() as MarketCoin[];
        if (!Array.isArray(data)) throw new Error("Market feed returned an invalid payload");
        setMarketCoins(data);
        setStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "The live market feed is unavailable.");
      }
    };
    void loadMarkets();
    const interval = window.setInterval(() => void loadMarkets(), 60000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const watchlist = useMemo(() => watchlistIds.map((id) => marketCoins.find((coin) => coin.id === id)).filter((coin): coin is MarketCoin => Boolean(coin)), [marketCoins, watchlistIds]);
  const searchResults = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return [];
    return marketCoins.filter((coin) => `${coin.symbol} ${coin.name} ${coin.id}`.toLowerCase().includes(query)).slice(0, 5);
  }, [marketCoins, searchInput]);

  const addToWatchlist = (coin: MarketCoin) => {
    setWatchlistIds((current) => current.includes(coin.id) ? current : [...current, coin.id]);
    setSearchInput("");
  };

  const removeFromWatchlist = (id: string) => setWatchlistIds((current) => current.filter((item) => item !== id));

  return (
    <div className="space-y-5">
      <Card className="surface-glow border-white/10 bg-card/80">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live market feed</p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Build your watchlist</h2>
            </div>
            <Badge variant="outline" className={status === "ready" ? "w-fit border-green-500/30 text-green-400" : "w-fit border-amber-500/30 text-amber-400"}>
              <span className={`mr-2 status-dot ${status === "ready" ? "bg-green-400" : "bg-amber-400"}`} />{status === "ready" ? "Live prices" : status === "loading" ? "Connecting" : "Offline"}
            </Badge>
          </div>
          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search live assets by symbol or name" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="min-h-12 bg-muted/50 pl-10 pr-3" aria-label="Search live assets" />
          </div>
          {searchInput && searchResults.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-background/80">
              {searchResults.map((coin) => {
                const selected = watchlistIds.includes(coin.id);
                return <button key={coin.id} type="button" onClick={() => addToWatchlist(coin)} disabled={selected} className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-white/5 px-4 text-left text-sm last:border-b-0 hover:bg-white/[0.04] disabled:opacity-50"><span><span className="font-semibold text-foreground">{coin.symbol.toUpperCase()}</span><span className="ml-2 text-muted-foreground">{coin.name}</span></span><span className="text-xs font-semibold text-accent">{selected ? "Added" : "Add"}</span></button>;
              })}
            </div>
          )}
          {searchInput && status === "ready" && searchResults.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No live asset matched “{searchInput}”. Try BTC, ETH, SOL, or a full coin name.</p>}
          {status === "error" && <p className="mt-3 flex items-center gap-2 text-xs text-amber-300"><WifiOff className="h-4 w-4" /> {errorMessage} Additions are disabled until the live feed returns.</p>}
        </div>
      </Card>

      <Card className="overflow-hidden border-white/10 bg-card/80">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Personal view</p><h2 className="mt-1 text-xl font-bold text-foreground">My Watchlist <span className="text-muted-foreground">({watchlist.length})</span></h2></div>
          <Star className="h-5 w-5 text-accent" />
        </div>
        {status === "loading" ? <div className="p-10 text-center text-sm text-muted-foreground">Loading live asset metadata…</div> : watchlist.length === 0 ? <div className="p-10 text-center"><Star className="mx-auto h-10 w-10 text-muted-foreground/50" /><p className="mt-4 font-semibold text-foreground">Your watchlist is empty</p><p className="mt-2 text-sm text-muted-foreground">Search the live market feed above to add assets. Nothing is pre-seeded.</p></div> : (
          <div className="divide-y divide-white/5">
            {watchlist.map((item) => {
              const change = item.price_change_percentage_24h ?? 0;
              return <div key={item.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-white/[0.025] sm:grid sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] sm:items-center sm:gap-3 sm:px-6">
                <Link href={`/asset/${item.id}`} className="flex min-w-0 items-center gap-3"><span className="rounded-xl border border-accent/20 bg-accent/10 p-2 text-accent"><Star className="h-4 w-4 fill-current" /></span><span className="min-w-0"><span className="block truncate font-semibold text-foreground">{item.symbol.toUpperCase()}</span><span className="block truncate text-xs text-muted-foreground">{item.name}</span></span></Link>
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:hidden">Price</p><p className="font-semibold text-foreground">${item.current_price.toLocaleString(undefined, { maximumFractionDigits: item.current_price < 1 ? 6 : 2 })}</p></div>
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:hidden">24h change</p><p className={`flex items-center gap-1 font-semibold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>{change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{change >= 0 ? "+" : ""}{change.toFixed(2)}%</p></div>
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:hidden">Volume</p><p className="text-sm text-muted-foreground">${(item.total_volume / 1e9).toFixed(2)}B</p></div>
                <Button size="icon" variant="ghost" onClick={() => removeFromWatchlist(item.id)} className="touch-target h-11 w-11 self-end text-muted-foreground hover:text-red-300 sm:self-auto" aria-label={`Remove ${item.symbol} from watchlist`}><Trash2 className="h-4 w-4" /></Button>
              </div>;
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
