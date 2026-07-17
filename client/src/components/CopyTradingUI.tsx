import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Users, Award } from "lucide-react";

interface Trader {
  id: string;
  name: string;
  strategy: string;
  winRate: number;
  monthlyReturn: number;
  followers: number;
  reputation: number;
  totalTrades: number;
  isFollowing: boolean;
}

export default function CopyTradingUI() {
  const [traders, setTraders] = useState<Trader[]>([
    {
      id: "trader-1",
      name: "VolumeAnalyst",
      strategy: "Technical Analysis",
      winRate: 71,
      monthlyReturn: 31.2,
      followers: 8950,
      reputation: 4.5,
      totalTrades: 428,
      isFollowing: false,
    },
    {
      id: "trader-2",
      name: "CryptoMaster",
      strategy: "Scalping",
      winRate: 68,
      monthlyReturn: 24.5,
      followers: 5420,
      reputation: 4.3,
      totalTrades: 342,
      isFollowing: false,
    },
    {
      id: "trader-3",
      name: "TrendFollower",
      strategy: "Swing Trading",
      winRate: 62,
      monthlyReturn: 18.3,
      followers: 3120,
      reputation: 4.0,
      totalTrades: 215,
      isFollowing: false,
    },
  ]);

  const toggleFollow = (traderId: string) => {
    setTraders(
      traders.map((t) =>
        t.id === traderId ? { ...t, isFollowing: !t.isFollowing } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Top Traders</h2>
        <p className="text-muted-foreground">Follow and copy trades from the best performers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {traders.map((trader) => (
          <Card key={trader.id} className="bg-card border-border/50 hover:border-accent/50 transition-colors">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{trader.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{trader.strategy}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(trader.reputation)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                  <p className="text-lg font-bold text-green-400">{trader.winRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Monthly Return</p>
                  <p className="text-lg font-bold text-accent">{trader.monthlyReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Followers</p>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <p className="font-semibold text-foreground">{(trader.followers / 1000).toFixed(1)}K</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
                  <p className="font-semibold text-foreground">{trader.totalTrades}</p>
                </div>
              </div>

              {/* Performance Badge */}
              <div className="mb-4 flex gap-2">
                {trader.winRate > 70 && <Badge className="bg-green-600/20 text-green-400">High Win Rate</Badge>}
                {trader.monthlyReturn > 25 && <Badge className="bg-accent/20 text-accent">Top Performer</Badge>}
              </div>

              {/* Action Button */}
              <Button
                onClick={() => toggleFollow(trader.id)}
                className={`w-full ${
                  trader.isFollowing
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {trader.isFollowing ? "Following" : "Follow & Copy"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
