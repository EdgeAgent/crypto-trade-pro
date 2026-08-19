import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, LockKeyhole, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiveQuotePanel from "@/components/LiveQuotePanel";
import OrderBook from "@/components/OrderBook";
import RecentTrades from "@/components/RecentTrades";
import { trpc } from "@/lib/trpc";
import { useLiveTicker } from "@/hooks/useLiveTicker";

type TradeSide = "BUY" | "SELL";
type OrderType = "market" | "limit";

const symbols: Record<string, string> = {
  bitcoin: "BTC/USDT",
  ethereum: "ETH/USDT",
  cardano: "ADA/USDT",
};

export default function Trading() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [tradeSide, setTradeSide] = useState<TradeSide>("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [confirmLiveOrder, setConfirmLiveOrder] = useState(false);
  const [liveOrderStatus, setLiveOrderStatus] = useState<string | null>(null);

  const liveOrderMutation = trpc.trading.placeLiveMarketOrder.useMutation();
  const symbol = symbols[selectedCoin] ?? "BTC/USDT";
  const streamSymbol = symbol.replace("/", "").toLowerCase();
  const ticker = useLiveTicker(streamSymbol);
  const currentPrice = ticker.data?.price ?? 0;
  const currentChange = ticker.data?.change24h ?? 0;
  const liveModeReady = false;

  const orderValue = useMemo(() => {
    const parsedQuantity = Number(quantity);
    const parsedPrice = orderType === "limit" ? Number(price) : currentPrice;
    if (!Number.isFinite(parsedQuantity) || !Number.isFinite(parsedPrice)) return 0;
    return parsedQuantity * parsedPrice;
  }, [currentPrice, orderType, price, quantity]);

  const handlePlacePaperOrder = () => {
    setLiveOrderStatus(`Paper ${tradeSide.toLowerCase()} order staged for review: ${quantity || "0"} ${symbol}.`);
  };

  const handleLiveOrderRequest = () => {
    if (!liveModeReady) return;
    setConfirmLiveOrder(true);
  };

  const submitConfirmedLiveOrder = async () => {
    if (!liveModeReady) return;

    try {
      await liveOrderMutation.mutateAsync({
        broker: "binance",
        symbol,
        side: tradeSide,
        quantity: Number(quantity),
        price: orderType === "limit" ? Number(price) : currentPrice,
        dailyLossLimit: 1000,
        dailyLossUsed: 0,
        explicitConfirmation: true,
      });
      setConfirmLiveOrder(false);
      setLiveOrderStatus("Live order submitted for broker execution.");
    } catch (error) {
      setConfirmLiveOrder(false);
      setLiveOrderStatus(error instanceof Error ? error.message : "Live order was rejected by the safety gate.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Trading</h1>
          <p className="text-sm text-muted-foreground mt-1">Market analysis and guarded order entry</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LiveQuotePanel symbol={symbol} ticker={ticker} />
          <OrderBook symbol={symbol} />
        </div>

        <div className="mb-8">
          <RecentTrades symbol={streamSymbol} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Order preview</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Review the notional value before staging a paper order or requesting live execution.</p>
                  </div>
                  <ShieldAlert className="h-5 w-5 text-accent" />
                </div>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Side</p><p className="mt-1 font-semibold text-foreground">{tradeSide}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Symbol</p><p className="mt-1 font-semibold text-foreground">{symbol}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="mt-1 font-semibold text-foreground">{orderType.toUpperCase()}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Notional</p><p className="mt-1 font-semibold text-foreground">${orderValue.toFixed(2)}</p></div>
                </div>
                {liveOrderStatus && <p className="mt-4 rounded-lg border border-border/50 bg-muted/20 p-3 text-sm text-muted-foreground">{liveOrderStatus}</p>}
              </div>
            </Card>

            <Card className="border-amber-500/30 bg-amber-500/5">
              <div className="p-6 flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <h2 className="font-semibold text-amber-300">Live execution is locked</h2>
                  <p className="mt-1 text-sm leading-6 text-amber-200/80">The per-order confirmation flow is ready, but this account has no verified broker credentials. Placeholder fields never submit an order, so only paper order staging is available.</p>
                  <Button type="button" onClick={handleLiveOrderRequest} disabled={!liveModeReady} className="mt-4 bg-muted text-muted-foreground">{liveModeReady ? "Review live order" : "Configure broker to review live order"}</Button>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="bg-card border-border/50">
              <div className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-6">Place order</h2>

                <Tabs value={tradeSide.toLowerCase()} onValueChange={(value) => setTradeSide(value === "sell" ? "SELL" : "BUY")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>

                  {(["buy", "sell"] as const).map((side) => (
                    <TabsContent key={side} value={side} className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between"><label htmlFor="coin" className="text-sm font-medium text-foreground">Coin</label><span className={`text-xs ${ticker.status === "live" ? "text-green-400" : "text-amber-400"}`}>{ticker.status === "live" ? "Live quote" : ticker.status}</span></div>
                        <select id="coin" value={selectedCoin} onChange={(event) => setSelectedCoin(event.target.value)} className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-md text-foreground">
                          <option value="bitcoin">Bitcoin (BTC)</option>
                          <option value="ethereum">Ethereum (ETH)</option>
                          <option value="cardano">Cardano (ADA)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="order-type" className="text-sm font-medium text-foreground">Order type</label>
                        <select id="order-type" value={orderType} onChange={(event) => setOrderType(event.target.value as OrderType)} className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-md text-foreground">
                          <option value="market">Market</option>
                          <option value="limit">Limit</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="quantity" className="text-sm font-medium text-foreground">Quantity</label>
                        <Input id="quantity" type="number" min="0" placeholder="0.00" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 bg-muted border-border" />
                      </div>

                      {orderType === "limit" && (
                        <div>
                          <label htmlFor="price" className="text-sm font-medium text-foreground">Limit price</label>
                          <Input id="price" type="number" min="0" placeholder="0.00" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2 bg-muted border-border" />
                        </div>
                      )}

                      <Button className={`w-full ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`} onClick={handlePlacePaperOrder}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Stage paper {side} order
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {confirmLiveOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-lg border-red-500/50 bg-card">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-6 w-6 text-red-400 shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-red-300">Confirm this real order</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">This confirmation applies to this order only. If accepted, the app will send explicit confirmation to the server-side live-order safety gate.</p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-foreground space-y-2">
                <p><span className="text-muted-foreground">Order:</span> {tradeSide} {quantity || "0"} {symbol}</p>
                <p><span className="text-muted-foreground">Estimated notional:</span> ${orderValue.toFixed(2)}</p>
                <p><span className="text-muted-foreground">Daily loss limit:</span> $1,000</p>
              </div>
              <div className="mt-6 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirmLiveOrder(false)}>Cancel</Button>
                <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={submitConfirmedLiveOrder} disabled={liveOrderMutation.isPending}>I understand — submit order</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
