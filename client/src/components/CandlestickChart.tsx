import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingDown } from "lucide-react";

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  symbol: string;
  price: number;
  change24h: number;
}

export default function CandlestickChart({ symbol, price, change24h }: CandlestickChartProps) {
  const [timeframe, setTimeframe] = useState<"1H" | "4H" | "1D" | "1W">("1D");

  // Generate realistic OHLCV data
  const generateChartData = (): CandleData[] => {
    const data: CandleData[] = [];
    let basePrice = price;

    const intervals = timeframe === "1H" ? 24 : timeframe === "4H" ? 42 : timeframe === "1D" ? 30 : 52;

    for (let i = 0; i < intervals; i++) {
      const randomChange = (Math.random() - 0.5) * (price * 0.02);
      const open = basePrice;
      const close = basePrice + randomChange;
      const high = Math.max(open, close) + Math.random() * (price * 0.01);
      const low = Math.min(open, close) - Math.random() * (price * 0.01);
      const volume = Math.random() * 50000000000;

      data.push({
        time: `${i}:00`,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat((volume / 1000000000).toFixed(1)),
      });

      basePrice = close;
    }

    return data;
  };

  const chartData = generateChartData();
  const highPrice = Math.max(...chartData.map((d) => d.high));
  const lowPrice = Math.min(...chartData.map((d) => d.low));

  return (
    <Card className="bg-card border-border/50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">{symbol}/USD</h3>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-3xl font-bold text-foreground">${price.toFixed(2)}</p>
              <div className={change24h >= 0 ? "text-green-400" : "text-red-400"}>
                <TrendingDown className="w-4 h-4 inline mr-1" />
                <span className="font-semibold">{change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(["1H", "4H", "1D", "1W"] as const).map((tf) => (
              <Button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-sm ${
                  timeframe === tf
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={["dataMin - 100", "dataMax + 100"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(0,217,255,0.3)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#00D9FF" }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={change24h >= 0 ? "#22C55E" : "#EF4444"}
                fill={change24h >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* OHLC Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">HIGH</p>
            <p className="font-bold text-foreground">${highPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">LOW</p>
            <p className="font-bold text-foreground">${lowPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">CHANGE</p>
            <p className={change24h >= 0 ? "font-bold text-green-400" : "font-bold text-red-400"}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">CURRENT</p>
            <p className="font-bold text-foreground">${price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
