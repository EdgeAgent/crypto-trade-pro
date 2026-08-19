import React, { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ExternalLink, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AssetData {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  market_cap_rank: number | null;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_30d: number | null;
    market_cap: { usd: number };
    total_volume: { usd: number };
    circulating_supply: number | null;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    ath_date: { usd: string };
  };
  links?: { homepage?: string[] };
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Unavailable";
  if (value >= 1) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 8 })}`;
}

function formatCompact(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Unavailable";
  return `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`;
}

export default function AssetDetail() {
  const [, params] = useRoute("/asset/:id");
  const assetId = params?.id ?? "bitcoin";
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAsset = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(assetId)}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);
        if (!response.ok) throw new Error(`Market data request failed (${response.status})`);
        const data = await response.json() as AssetData;
        if (!cancelled) {
          setAsset(data);
          setLastUpdated(new Date());
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Unable to load live asset data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAsset();
    const interval = window.setInterval(fetchAsset, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [assetId]);

  if (loading && !asset) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading live asset data…</div>;
  }

  if (error && !asset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-lg border-red-500/30 bg-red-500/5 p-6">
          <h1 className="text-xl font-bold text-red-300">Live asset data unavailable</h1>
          <p className="mt-2 text-sm text-red-200/80">{error}</p>
          <Link href="/markets" className="mt-5 inline-flex items-center text-sm text-accent hover:underline"><ArrowLeft className="mr-2 h-4 w-4" />Back to markets</Link>
        </Card>
      </div>
    );
  }

  if (!asset) return null;
  const data = asset.market_data;
  const dailyChange = data.price_change_percentage_24h ?? 0;
  const weeklyChange = data.price_change_percentage_7d ?? 0;
  const monthlyChange = data.price_change_percentage_30d ?? 0;
  const website = asset.links?.homepage?.find(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/markets" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Markets</Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span>CoinGecko live feed</span><span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Updating"}</span><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-accent" : ""}`} /></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={asset.image.large} alt={asset.name} className="h-16 w-16 rounded-full" />
            <div>
              <div className="flex items-center gap-3"><h1 className="text-3xl font-bold text-foreground">{asset.name}</h1><Badge variant="outline">{asset.symbol.toUpperCase()}</Badge></div>
              <p className="mt-1 text-sm text-muted-foreground">Market rank #{asset.market_cap_rank ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {website && <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ExternalLink className="mr-2 h-4 w-4" />Official site</a>}
            <Link href={`/trading?asset=${asset.id}`}><Button className="bg-accent text-accent-foreground hover:bg-accent/90">Trade {asset.symbol.toUpperCase()}</Button></Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border/50 bg-card"><div className="p-6"><p className="text-sm text-muted-foreground">Current price</p><div className="mt-2 flex items-baseline gap-3"><p className="text-4xl font-bold text-foreground">{formatCurrency(data.current_price.usd)}</p><span className={`inline-flex items-center gap-1 font-semibold ${dailyChange >= 0 ? "text-green-400" : "text-red-400"}`}>{dailyChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{dailyChange >= 0 ? "+" : ""}{dailyChange.toFixed(2)}%</span></div><p className="mt-3 text-sm text-muted-foreground">Live market quote refreshed every 60 seconds.</p></div></Card>
          <Card className="border-border/50 bg-card"><div className="p-6"><p className="text-sm text-muted-foreground">Performance</p><div className="mt-4 space-y-3"><div className="flex justify-between"><span className="text-sm text-muted-foreground">7 days</span><span className={weeklyChange >= 0 ? "text-green-400" : "text-red-400"}>{weeklyChange >= 0 ? "+" : ""}{weeklyChange.toFixed(2)}%</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">30 days</span><span className={monthlyChange >= 0 ? "text-green-400" : "text-red-400"}>{monthlyChange >= 0 ? "+" : ""}{monthlyChange.toFixed(2)}%</span></div></div></div></Card>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Market cap", formatCompact(data.market_cap.usd)],
            ["24h volume", formatCompact(data.total_volume.usd)],
            ["Circulating supply", data.circulating_supply?.toLocaleString() ?? "Unavailable"],
            ["All-time high", formatCurrency(data.ath.usd)],
          ].map(([label, value]) => <Card key={label} className="border-border/50 bg-card"><div className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-lg font-bold text-foreground">{value}</p></div></Card>)}
        </div>

        <Card className="mt-6 border-border/50 bg-card"><div className="p-6"><h2 className="text-lg font-bold text-foreground">Supply and all-time-high detail</h2><div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div><p className="text-muted-foreground">Total supply</p><p className="mt-1 font-semibold text-foreground">{data.total_supply?.toLocaleString() ?? "Unavailable"}</p></div><div><p className="text-muted-foreground">Maximum supply</p><p className="mt-1 font-semibold text-foreground">{data.max_supply?.toLocaleString() ?? "Unlimited / unavailable"}</p></div><div><p className="text-muted-foreground">Distance from ATH</p><p className="mt-1 font-semibold text-red-400">{data.ath_change_percentage.usd.toFixed(2)}%</p><p className="mt-1 text-xs text-muted-foreground">ATH recorded {new Date(data.ath_date.usd).toLocaleDateString()}</p></div></div></div></Card>
      </div>
    </div>
  );
}
