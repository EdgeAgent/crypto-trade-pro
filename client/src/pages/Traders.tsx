import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Users, DollarSign } from "lucide-react";

interface Trader {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  monthlyReturn: number;
  followers: number;
  totalTrades: number;
  rating: number;
  badges: string[];
  isFollowing: boolean;
}

export default function Traders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"winRate" | "returns" | "followers">("winRate");
  const [traders, setTraders] = useState<Trader[]>([
    {
      id: "1",
      name: "VolumeAnalyst",
      avatar: "VA",
      winRate: 71,
      monthlyReturn: 24.5,
      followers: 1250,
      totalTrades: 342,
      rating: 4.8,
      badges: ["High Win Rate", "Top Performer"],
      isFollowing: false,
    },
    {
      id: "2",
      name: "CryptoMaster",
      avatar: "CM",
      winRate: 68,
      monthlyReturn: 18.2,
      followers: 892,
      totalTrades: 256,
      rating: 4.6,
      badges: ["Consistent Trader"],
      isFollowing: false,
    },
    {
      id: "3",
      name: "TrendFollower",
      avatar: "TF",
      winRate: 62,
      monthlyReturn: 15.8,
      followers: 654,
      totalTrades: 189,
      rating: 4.3,
      badges: ["Rising Star"],
      isFollowing: false,
    },
    {
      id: "4",
      name: "SwingTrader",
      avatar: "ST",
      winRate: 75,
      monthlyReturn: 32.1,
      followers: 2100,
      totalTrades: 521,
      rating: 4.9,
      badges: ["Legendary", "High Win Rate", "Top Performer"],
      isFollowing: false,
    },
    {
      id: "5",
      name: "ScalpMaster",
      avatar: "SM",
      winRate: 58,
      monthlyReturn: 12.3,
      followers: 445,
      totalTrades: 1203,
      rating: 4.1,
      badges: ["High Volume"],
      isFollowing: false,
    },
  ]);

  const filteredAndSortedTraders = useMemo(() => {
    let filtered = traders.filter((trader) =>
      trader.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "winRate") return b.winRate - a.winRate;
      if (sortBy === "returns") return b.monthlyReturn - a.monthlyReturn;
      return b.followers - a.followers;
    });
  }, [searchQuery, sortBy, traders]);

  const handleFollow = (traderId: string) => {
    setTraders(
      traders.map((t) =>
        t.id === traderId ? { ...t, isFollowing: !t.isFollowing } : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Top Traders</h1>
          <p className="text-muted-foreground">Discover and copy trades from top-performing traders</p>
        </div>

        {/* Search and Filter */}
        <Card className="bg-card border-border/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search traders by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <div className="flex gap-2">
              {(["winRate", "returns", "followers"] as const).map((sort) => (
                <Button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`${
                    sortBy === sort
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sort === "winRate" ? "Win Rate" : sort === "returns" ? "Returns" : "Followers"}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Traders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTraders.map((trader) => (
            <Card key={trader.id} className="bg-card border-border/50 hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="font-bold text-accent text-lg">{trader.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{trader.name}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(trader.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{trader.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {trader.badges.map((badge) => (
                    <Badge key={badge} className="bg-accent/20 text-accent border-accent/30">
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="font-bold text-green-400">{trader.winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Return</span>
                    <span className="font-bold text-green-400">+{trader.monthlyReturn}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Trades</span>
                    <span className="font-bold text-foreground">{trader.totalTrades}</span>
                  </div>
                </div>

                {/* Followers */}
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{trader.followers.toLocaleString()} followers</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFollow(trader.id)}
                    className={`flex-1 ${
                      trader.isFollowing
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {trader.isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button
                    className="flex-1 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedTraders.length === 0 && (
          <Card className="bg-card border-border/50 p-12 text-center">
            <p className="text-muted-foreground">No traders found matching your search</p>
          </Card>
        )}
      </div>
    </div>
  );
}
