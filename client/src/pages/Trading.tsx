import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import AdvancedCharts from "@/components/AdvancedCharts";
import OrderBook from "@/components/OrderBook";

export default function Trading() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handlePlaceOrder = () => {
    console.log({
      coin: selectedCoin,
      type: tradeType,
      orderType,
      quantity,
      price,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Trading</h1>
          <p className="text-sm text-muted-foreground mt-1">Paper trading simulator</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Charts and Order Book */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AdvancedCharts symbol="BTC" price={62715} change24h={-2.46} />
          <OrderBook symbol="BTC" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Recent Trades */}
            <div className="space-y-6">
              {/* Placeholder for recent trades */}
            </div>
          </div>

          <div>
            <Card className="bg-card border-border/50">
              <div className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-6">Place Order</h2>

                <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as any)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>

                  <TabsContent value="buy" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Coin</label>
                      <select
                        value={selectedCoin}
                        onChange={(e) => setSelectedCoin(e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                      >
                        <option value="bitcoin">Bitcoin (BTC)</option>
                        <option value="ethereum">Ethereum (ETH)</option>
                        <option value="cardano">Cardano (ADA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Order Type</label>
                      <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value as any)}
                        className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                      >
                        <option value="market">Market</option>
                        <option value="limit">Limit</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Quantity</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-2 bg-muted border-border"
                      />
                    </div>

                    {orderType === "limit" && (
                      <div>
                        <label className="text-sm font-medium text-foreground">Price</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="mt-2 bg-muted border-border"
                        />
                      </div>
                    )}

                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handlePlaceOrder}>
                      Buy
                    </Button>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Coin</label>
                      <select
                        value={selectedCoin}
                        onChange={(e) => setSelectedCoin(e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                      >
                        <option value="bitcoin">Bitcoin (BTC)</option>
                        <option value="ethereum">Ethereum (ETH)</option>
                        <option value="cardano">Cardano (ADA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Order Type</label>
                      <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value as any)}
                        className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                      >
                        <option value="market">Market</option>
                        <option value="limit">Limit</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Quantity</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-2 bg-muted border-border"
                      />
                    </div>

                    {orderType === "limit" && (
                      <div>
                        <label className="text-sm font-medium text-foreground">Price</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="mt-2 bg-muted border-border"
                        />
                      </div>
                    )}

                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handlePlaceOrder}>
                      Sell
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
