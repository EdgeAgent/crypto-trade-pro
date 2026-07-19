import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Eye, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { getLoginUrl } from "@/const";
import PortfolioHoldings from "@/components/PortfolioHoldings";
import Watchlist from "@/components/Watchlist";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [topCoins, setTopCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(100000);
  const [portfolioPnL, setPortfolioPnL] = useState(0);

  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=false"
        );
        const data = await response.json();
        setTopCoins(data);
      } catch (error) {
        console.error("Failed to fetch coins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCoins();
    const interval = setInterval(fetchTopCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPortfolioValue(1000);
    setPortfolioPnL(0);
  }, []);

  const displayValue = portfolioValue / 100;
  const displayPnL = portfolioPnL / 100;
  const pnlPercent = ((displayPnL / 1000) * 100).toFixed(2);
  const pnlTrend = displayPnL >= 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">CryptoTrade Pro</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, {user?.name || "Trader"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Watchlist
              </Button>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" />
                New Trade
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border/50 col-span-1 md:col-span-2">
            <div className="p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">TOTAL PORTFOLIO VALUE</p>
              <div className="flex items-baseline gap-4">
                <h2 className="text-4xl font-bold text-foreground">${displayValue.toFixed(2)}</h2>
                <div className={pnlTrend ? "text-green-500" : "text-red-500"}>
                  <div className="flex items-center gap-1 text-lg font-semibold">
                    {pnlTrend ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span>${Math.abs(displayPnL).toFixed(2)}</span>
                    <span className="text-xs">({pnlPercent}%)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${Math.min((displayValue / 1500) * 100, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border/50">
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Holdings</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                <p className="text-xl font-bold text-green-400">+0.00%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs for Holdings and Watchlist */}
        <div className="space-y-8">
          {/* Portfolio Holdings Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Portfolio Holdings</h2>
            <PortfolioHoldings />
          </div>

          {/* Watchlist Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Watchlist</h2>
            <Watchlist />
          </div>

          {/* Top Cryptocurrencies */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Top Cryptocurrencies</h2>
            {loading ? (
              <Card className="bg-card border-border/50 p-8 text-center">
                <p className="text-muted-foreground">Loading market data...</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topCoins.map((coin) => (
                  <Card key={coin.id} className="bg-card border-border/50 hover:border-accent/50 transition-colors cursor-pointer">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">{coin.symbol.toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-foreground mb-2">${coin.current_price.toFixed(2)}</p>
                      <p className={coin.price_change_percentage_24h >= 0 ? "text-green-400 text-sm font-semibold" : "text-red-400 text-sm font-semibold"}>
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
