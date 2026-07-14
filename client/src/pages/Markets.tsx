import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  ath: number;
  atl: number;
}

export default function Markets() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"market_cap" | "price_change">("market_cap");

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false"
        );
        const data = await response.json();
        setCoins(data);
      } catch (error) {
        console.error("Failed to fetch coins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins
    .filter((coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "market_cap") {
        return (b.market_cap || 0) - (a.market_cap || 0);
      } else {
        return b.price_change_percentage_24h - a.price_change_percentage_24h;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Markets</h1>
          <p className="text-sm text-muted-foreground mt-1">Explore all cryptocurrencies</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-card border border-border rounded-md text-foreground"
          >
            <option value="market_cap">Sort by Market Cap</option>
            <option value="price_change">Sort by 24h Change</option>
          </select>
        </div>

        {loading ? (
          <Card className="bg-card border-border/50 p-8 flex items-center justify-center">
            <Spinner />
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredCoins.map((coin) => {
              const trend = coin.price_change_percentage_24h >= 0;
              return (
                <Card key={coin.id} className="bg-card border-border/50 hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-semibold text-foreground">{coin.name}</p>
                          <p className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="font-bold text-foreground">${coin.current_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                        <div className={trend ? "text-green-500" : "text-red-500"}>
                          <div className="flex items-center gap-1 font-semibold">
                            {trend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                        <p className="font-semibold text-foreground">${(coin.market_cap / 1e9).toFixed(2)}B</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Volume</p>
                        <p className="font-semibold text-foreground">${(coin.total_volume / 1e9).toFixed(2)}B</p>
                      </div>
                      <div className="flex justify-end">
                        <button className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md font-medium transition-colors">
                          Trade
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
