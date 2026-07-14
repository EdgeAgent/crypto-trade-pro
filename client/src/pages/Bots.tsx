import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Play, Pause, Trash2, TrendingUp, AlertCircle } from "lucide-react";

interface Bot {
  id: string;
  name: string;
  strategy: string;
  status: "active" | "paused" | "stopped";
  trades: number;
  winRate: number;
  monthlyReturn: number;
  totalProfit: number;
  riskLevel: "low" | "medium" | "high";
}

const mockBots: Bot[] = [
  {
    id: "1",
    name: "Scalp Master Pro",
    strategy: "High-Frequency Scalping",
    status: "active",
    trades: 342,
    winRate: 68,
    monthlyReturn: 24.5,
    totalProfit: 12450,
    riskLevel: "medium",
  },
  {
    id: "2",
    name: "Trend Rider",
    strategy: "Trend Following",
    status: "active",
    trades: 45,
    winRate: 72,
    monthlyReturn: 18.3,
    totalProfit: 8920,
    riskLevel: "low",
  },
  {
    id: "3",
    name: "Volatility Hunter",
    strategy: "Mean Reversion",
    status: "paused",
    trades: 128,
    winRate: 61,
    monthlyReturn: 15.2,
    totalProfit: 5340,
    riskLevel: "high",
  },
];

export default function Bots() {
  const [bots, setBots] = useState<Bot[]>(mockBots);

  const toggleBot = (id: string) => {
    setBots(
      bots.map((bot) =>
        bot.id === id
          ? { ...bot, status: bot.status === "active" ? "paused" : "active" }
          : bot
      )
    );
  };

  const deleteBot = (id: string) => {
    setBots(bots.filter((bot) => bot.id !== id));
  };

  const getRiskColor = (risk: string) => {
    if (risk === "low") return "bg-green-500/20 text-green-400";
    if (risk === "medium") return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trading Bots</h1>
            <p className="text-sm text-muted-foreground mt-1">Deploy and manage automated trading strategies</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create Bot
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="bg-card border-border/50">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground">{bot.strategy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(bot.riskLevel)}>{bot.riskLevel.toUpperCase()}</Badge>
                    <Badge variant={bot.status === "active" ? "default" : "secondary"}>
                      {bot.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-lg font-bold text-green-400">{bot.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly Return</p>
                    <p className="text-lg font-bold text-green-400">+{bot.monthlyReturn}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
                    <p className="text-lg font-bold text-foreground">{bot.trades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
                    <p className="text-lg font-bold text-green-400">${bot.totalProfit.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={bot.status === "active"}
                      onCheckedChange={() => toggleBot(bot.id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {bot.status === "active" ? "Running" : "Paused"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => deleteBot(bot.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {bots.length === 0 && (
          <Card className="bg-card border-border/50">
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Bots Created Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first trading bot to start automated trading</p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Bot
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
