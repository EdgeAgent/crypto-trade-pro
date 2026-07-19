import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react";

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export default function PortfolioHoldings() {
  const holdings: Holding[] = [
    {
      id: "1",
      symbol: "BTC",
      name: "Bitcoin",
      quantity: 0.5,
      entryPrice: 62000,
      currentPrice: 62715,
      totalValue: 31357.5,
      unrealizedPnL: 357.5,
      unrealizedPnLPercent: 1.15,
    },
    {
      id: "2",
      symbol: "ETH",
      name: "Ethereum",
      quantity: 5,
      entryPrice: 1800,
      currentPrice: 1815.69,
      totalValue: 9078.45,
      unrealizedPnL: 78.45,
      unrealizedPnLPercent: 0.87,
    },
    {
      id: "3",
      symbol: "SOL",
      name: "Solana",
      quantity: 20,
      entryPrice: 70,
      currentPrice: 73.81,
      totalValue: 1476.2,
      unrealizedPnL: 76.2,
      unrealizedPnLPercent: 5.44,
    },
  ];

  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalPnL = holdings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
  const totalPnLPercent = (totalPnL / (totalValue - totalPnL)) * 100;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-card border-border/50">
        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Holdings Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Holdings Value</p>
              <p className="text-2xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Unrealized P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${totalPnL.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Return %</p>
              <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnLPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Holdings Table */}
      <Card className="bg-card border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Asset</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Quantity</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Entry Price</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Current Price</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Total Value</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Unrealized P&L</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-foreground">{holding.symbol}</p>
                      <p className="text-xs text-muted-foreground">{holding.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-foreground">{holding.quantity.toFixed(4)}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">${holding.entryPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-foreground font-medium">${holding.currentPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-foreground font-semibold">${holding.totalValue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {holding.unrealizedPnL >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={holding.unrealizedPnL >= 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                        ${holding.unrealizedPnL.toFixed(2)} ({holding.unrealizedPnLPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
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
      </Card>
    </div>
  );
}
