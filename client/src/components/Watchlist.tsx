import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    {
      id: "1",
      symbol: "BTC",
      name: "Bitcoin",
      price: 62715,
      change24h: -2.46,
      marketCap: 1230000000000,
      volume24h: 28500000000,
    },
    {
      id: "2",
      symbol: "ETH",
      name: "Ethereum",
      price: 1815.69,
      change24h: -3.47,
      marketCap: 218000000000,
      volume24h: 8900000000,
    },
    {
      id: "3",
      symbol: "SOL",
      name: "Solana",
      price: 73.81,
      change24h: -3.22,
      marketCap: 34000000000,
      volume24h: 1200000000,
    },
  ]);

  const [searchInput, setSearchInput] = useState("");

  const removeFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter((item) => item.id !== id));
  };

  const addToWatchlist = () => {
    if (searchInput.trim()) {
      const newItem: WatchlistItem = {
        id: Date.now().toString(),
        symbol: searchInput.toUpperCase(),
        name: searchInput,
        price: Math.random() * 100000,
        change24h: (Math.random() - 0.5) * 10,
        marketCap: Math.random() * 1000000000000,
        volume24h: Math.random() * 50000000000,
      };
      setWatchlist([...watchlist, newItem]);
      setSearchInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add to Watchlist */}
      <Card className="bg-card border-border/50">
        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Add to Watchlist</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by symbol (BTC, ETH, SOL...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addToWatchlist()}
              className="bg-muted border-border"
            />
            <Button
              onClick={addToWatchlist}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Watchlist Items */}
      <Card className="bg-card border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground">My Watchlist ({watchlist.length})</h2>
        </div>

        {watchlist.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground">Add coins to track them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Asset</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">24h Change</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Market Cap</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">24h Volume</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => (
                  <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <div>
                          <p className="font-semibold text-foreground">{item.symbol}</p>
                          <p className="text-xs text-muted-foreground">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-foreground font-semibold">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={item.change24h >= 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                          {item.change24h >= 0 ? "+" : ""}{item.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      ${(item.marketCap / 1000000000).toFixed(0)}B
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      ${(item.volume24h / 1000000000).toFixed(1)}B
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromWatchlist(item.id)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
