import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, TrendingDown, Plus, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [topCoins, setTopCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(100000);
  const [portfolioPnL, setPortfolioPnL] = useState(0);

  // Portfolio data (mock for now - will connect to tRPC later)
  // const portfolioQuery = trpc.portfolio.get.useQuery(undefined, {
  //   enabled: isAuthenticated,
  // });

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

  // Mock portfolio data for now
  useEffect(() => {
    setPortfolioValue(1000); // $1000 starting balance
    setPortfolioPnL(0); // No P&L yet
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
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                <p className={pnlTrend ? "text-green-500" : "text-red-500"}>
                  <span className="text-lg font-semibold">
                    {pnlTrend ? "+" : ""}{pnlPercent}%
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Cryptocurrencies</h3>
          {loading ? (
            <Card className="bg-card border-border/50 p-8 flex items-center justify-center">
              <Spinner />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topCoins.map((coin) => {
                const coinTrend = coin.price_change_percentage_24h >= 0;
                return (
                  <Card key={coin.id} className="bg-card border-border/50 hover:border-accent/50 transition-colors cursor-pointer">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{coin.symbol.toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-foreground mb-2">${coin.current_price.toFixed(2)}</p>
                      <div className={coinTrend ? "text-green-500" : "text-red-500"}>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          {coinTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <Card className="bg-card border-border/50">
            <div className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                No trades yet. Start trading to see activity here.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
