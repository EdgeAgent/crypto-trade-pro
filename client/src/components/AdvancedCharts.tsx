import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ChartData {
  time: string;
  price: number;
}

interface AdvancedChartsProps {
  symbol: string;
  price: number;
  change24h: number;
}

export default function AdvancedCharts({ symbol, price, change24h }: AdvancedChartsProps) {
  const [timeframe, setTimeframe] = useState<"1H" | "4H" | "1D" | "1W">("1D");
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Mock price data
  const generateMockData = () => {
    const data: ChartData[] = [];
    let currentPrice = price;
    const now = Date.now();

    for (let i = 50; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * currentPrice * 0.02;
      currentPrice = currentPrice + variance;

      data.push({
        time: new Date(now - i * 3600000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: Math.round(currentPrice * 100) / 100,
      });
    }

    return data;
  };

  useEffect(() => {
    setChartData(generateMockData());
  }, [timeframe, price]);

  const trend = change24h >= 0;
  const chartColor = trend ? "#22c55e" : "#ef4444";
  const highPrice = Math.max(...chartData.map((d) => d.price));
  const lowPrice = Math.min(...chartData.map((d) => d.price));

  return (
    <Card className="bg-card border-border/50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{symbol}/USD</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold text-foreground">${price.toFixed(2)}</span>
              <div className={trend ? "text-green-400" : "text-red-400"}>
                <div className="flex items-center gap-1">
                  {trend ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span className="font-semibold">{change24h.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(["1H", "4H", "1D", "1W"] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf ? "bg-accent text-accent-foreground" : ""}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" style={{ fontSize: "12px" }} />
              <YAxis stroke="#666" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">HIGH</p>
            <p className="font-semibold text-foreground">${highPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">LOW</p>
            <p className="font-semibold text-foreground">${lowPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">CHANGE</p>
            <p className={`font-semibold ${trend ? "text-green-400" : "text-red-400"}`}>
              {change24h.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">CURRENT</p>
            <p className="font-semibold text-foreground">${price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
