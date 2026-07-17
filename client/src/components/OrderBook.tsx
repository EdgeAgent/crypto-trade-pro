import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  // Mock order book data
  const bids: OrderBookEntry[] = [
    { price: 62700, quantity: 0.5, total: 31350 },
    { price: 62680, quantity: 1.2, total: 75216 },
    { price: 62650, quantity: 2.1, total: 131565 },
    { price: 62600, quantity: 0.8, total: 50080 },
    { price: 62550, quantity: 1.5, total: 93825 },
  ];

  const asks: OrderBookEntry[] = [
    { price: 62730, quantity: 0.6, total: 37638 },
    { price: 62750, quantity: 1.1, total: 69025 },
    { price: 62800, quantity: 2.3, total: 144440 },
    { price: 62850, quantity: 0.9, total: 56565 },
    { price: 62900, quantity: 1.7, total: 106930 },
  ];

  const maxQuantity = Math.max(
    ...bids.map((b) => b.quantity),
    ...asks.map((a) => a.quantity)
  );

  const renderOrderRow = (entry: OrderBookEntry, isBid: boolean) => {
    const percentage = (entry.quantity / maxQuantity) * 100;
    const bgColor = isBid ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)";
    const textColor = isBid ? "text-green-400" : "text-red-400";

    return (
      <div
        key={`${entry.price}-${entry.quantity}`}
        className="relative h-8 flex items-center px-3 border-b border-border/30 hover:bg-muted/50 transition-colors"
        style={{
          background: `linear-gradient(to ${isBid ? "right" : "left"}, ${bgColor}, transparent)`,
          backgroundSize: `${percentage}% 100%`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: isBid ? "left" : "right",
        }}
      >
        <div className="flex justify-between w-full text-xs relative z-10">
          <span className={textColor}>${entry.price.toFixed(2)}</span>
          <span className="text-muted-foreground">{entry.quantity.toFixed(4)}</span>
          <span className="text-muted-foreground">${entry.total.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border/50">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{symbol} Order Book</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Bids */}
          <div>
            <div className="text-xs font-semibold text-green-400 mb-3 px-3">BIDS (Buy Orders)</div>
            <div className="space-y-0">
              {bids.map((bid) => renderOrderRow(bid, true))}
            </div>
          </div>

          {/* Asks */}
          <div>
            <div className="text-xs font-semibold text-red-400 mb-3 px-3">ASKS (Sell Orders)</div>
            <div className="space-y-0">
              {asks.map((ask) => renderOrderRow(ask, false))}
            </div>
          </div>
        </div>

        {/* Spread */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Bid-Ask Spread:</span>
            <span className="font-semibold text-foreground">
              ${(asks[0].price - bids[0].price).toFixed(2)} (0.05%)
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-muted-foreground">Mid Price:</span>
            <span className="font-semibold text-foreground">
              ${((asks[0].price + bids[0].price) / 2).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
