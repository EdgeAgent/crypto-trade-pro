import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Copy, Star } from "lucide-react";

interface Trader {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  totalTrades: number;
  monthlyReturn: number;
  followers: number;
  reputation: number;
  strategy: string;
  isFollowing: boolean;
}

const mockTraders: Trader[] = [
  {
    id: "1",
    name: "CryptoMaster",
    avatar: "CM",
    winRate: 68,
    totalTrades: 342,
    monthlyReturn: 24.5,
    followers: 5420,
    reputation: 9.8,
    strategy: "Scalping",
    isFollowing: false,
  },
  {
    id: "2",
    name: "TrendFollower",
    avatar: "TF",
    winRate: 62,
    totalTrades: 215,
    monthlyReturn: 18.3,
    followers: 3120,
    reputation: 9.2,
    strategy: "Swing Trading",
    isFollowing: false,
  },
  {
    id: "3",
    name: "VolumeAnalyst",
    avatar: "VA",
    winRate: 71,
    totalTrades: 428,
    monthlyReturn: 31.2,
    followers: 8950,
    reputation: 9.9,
    strategy: "Technical Analysis",
    isFollowing: false,
  },
  {
    id: "4",
    name: "AlgoTrader",
    avatar: "AT",
    winRate: 59,
    totalTrades: 1024,
    monthlyReturn: 15.7,
    followers: 2340,
    reputation: 8.7,
    strategy: "Algorithmic",
    isFollowing: false,
  },
];

export default function Traders() {
  const [traders, setTraders] = useState<Trader[]>(mockTraders);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"reputation" | "followers" | "returns">("reputation");

  const filteredTraders = traders
    .filter((trader) =>
      trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.strategy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "reputation") return b.reputation - a.reputation;
      if (sortBy === "followers") return b.followers - a.followers;
      return b.monthlyReturn - a.monthlyReturn;
    });

  const toggleFollow = (id: string) => {
    setTraders(
      traders.map((t) =>
        t.id === id ? { ...t, isFollowing: !t.isFollowing, followers: t.isFollowing ? t.followers - 1 : t.followers + 1 } : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Top Traders</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover and copy trades from top performers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search traders or strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border-border"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-card border border-border rounded-md text-foreground"
          >
            <option value="reputation">Sort by Reputation</option>
            <option value="followers">Sort by Followers</option>
            <option value="returns">Sort by Returns</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredTraders.map((trader) => (
            <Card key={trader.id} className="bg-card border-border/50 hover:border-accent/50 transition-colors">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-accent text-accent-foreground font-bold">{trader.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{trader.name}</p>
                      <p className="text-xs text-muted-foreground">{trader.strategy}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                    <p className="font-bold text-green-500">{trader.winRate}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Return</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <p className="font-bold text-green-500">+{trader.monthlyReturn}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Followers</p>
                    <p className="font-bold text-foreground">{trader.followers.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reputation</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(trader.reputation / 2) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
                    <p className="font-bold text-foreground">{trader.totalTrades}</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFollow(trader.id)}
                      className={trader.isFollowing ? "bg-accent text-accent-foreground border-accent" : ""}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {trader.isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
