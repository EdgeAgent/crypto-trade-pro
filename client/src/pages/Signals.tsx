import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap, CheckCircle, AlertCircle } from "lucide-react";

interface Signal {
  id: string;
  symbol: string;
  type: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  source: "AI" | "Trader";
  timestamp: string;
  status: "active" | "closed" | "pending";
  pnl?: number;
  followers: number;
}

const mockSignals: Signal[] = [
  {
    id: "1",
    symbol: "BTC/USD",
    type: "BUY",
    confidence: 92,
    reasoning: "Strong social sentiment spike detected. Volume breakout confirmed. RSI oversold recovery pattern.",
    source: "AI",
    timestamp: "2 minutes ago",
    status: "active",
    followers: 1240,
  },
  {
    id: "2",
    symbol: "ETH/USD",
    type: "SELL",
    confidence: 78,
    reasoning: "Resistance level rejection. Bearish divergence on 4H chart. Profit taking signal.",
    source: "Trader",
    timestamp: "15 minutes ago",
    status: "active",
    pnl: 2.45,
    followers: 856,
  },
  {
    id: "3",
    symbol: "SOL/USD",
    type: "BUY",
    confidence: 85,
    reasoning: "Bullish flag breakout. Volume surge detected. Support level bounce confirmed.",
    source: "AI",
    timestamp: "1 hour ago",
    status: "closed",
    pnl: 5.32,
    followers: 2341,
  },
  {
    id: "4",
    symbol: "ADA/USD",
    type: "HOLD",
    confidence: 65,
    reasoning: "Consolidation pattern forming. Waiting for breakout direction confirmation.",
    source: "Trader",
    timestamp: "3 hours ago",
    status: "pending",
    followers: 432,
  },
];

export default function Signals() {
  const [signals, setSignals] = useState<Signal[]>(mockSignals);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");

  const filteredSignals = signals.filter((s) => filter === "all" || s.status === filter);

  const getSignalColor = (type: string) => {
    if (type === "BUY") return "bg-green-500/20 text-green-400 border-green-500/50";
    if (type === "SELL") return "bg-red-500/20 text-red-400 border-red-500/50";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  };

  const getStatusIcon = (status: string) => {
    if (status === "active") return <Zap className="w-4 h-4 text-yellow-400" />;
    if (status === "closed") return <CheckCircle className="w-4 h-4 text-green-400" />;
    return <AlertCircle className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Trading Signals</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-generated and trader-published signals with real-time tracking</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-2 mb-8">
          {(["all", "active", "closed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-accent text-accent-foreground" : ""}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} Signals
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredSignals.map((signal) => (
            <Card key={signal.id} className="bg-card border-border/50 hover:border-accent/50 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{signal.symbol}</h3>
                        <Badge className={`${getSignalColor(signal.type)} border`}>{signal.type}</Badge>
                        <Badge variant="outline">{signal.source}</Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(signal.status)}
                          <span className="text-xs text-muted-foreground">{signal.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{signal.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent mb-1">{signal.confidence}%</div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-sm text-foreground leading-relaxed">{signal.reasoning}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Followers</p>
                      <p className="font-semibold text-foreground">{signal.followers.toLocaleString()}</p>
                    </div>
                    {signal.pnl !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">P&L</p>
                        <div className={`font-semibold flex items-center gap-1 ${signal.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {signal.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {signal.pnl >= 0 ? "+" : ""}{signal.pnl.toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Copy Signal
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
