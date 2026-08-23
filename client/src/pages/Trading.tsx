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

const symbols: Record<string, string> = { bitcoin: "BTC/USDT", ethereum: "ETH/USDT", cardano: "ADA/USDT" };

function getInitialCoin() {
  if (typeof window === "undefined") return "bitcoin";
  const requestedSymbol = new URLSearchParams(window.location.search).get("symbol")?.toUpperCase();
  return Object.entries(symbols).find(([, pair]) => pair.startsWith(`${requestedSymbol}/`))?.[0] ?? "bitcoin";
}

export default function Trading() {
  const [selectedCoin, setSelectedCoin] = useState(getInitialCoin);
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
  const liveModeReady = false;
  const numericQuantity = Number(quantity);
  const hasValidQuantity = Number.isFinite(numericQuantity) && numericQuantity > 0;

  const orderValue = useMemo(() => {
    const parsedPrice = orderType === "limit" ? Number(price) : currentPrice;
    if (!hasValidQuantity || !Number.isFinite(parsedPrice) || parsedPrice <= 0) return 0;
    return numericQuantity * parsedPrice;
  }, [currentPrice, hasValidQuantity, numericQuantity, orderType, price]);

  const handlePlacePaperOrder = () => {
    if (!hasValidQuantity) {
      setLiveOrderStatus("Enter a quantity greater than zero before staging this paper order.");
      return;
    }
    if (orderType === "limit" && (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
      setLiveOrderStatus("Enter a limit price greater than zero before staging this paper order.");
      return;
    }
    setLiveOrderStatus(`Paper ${tradeSide.toLowerCase()} order staged for review: ${quantity} ${symbol}. No order was sent to a broker.`);
  };

  const handleLiveOrderRequest = () => {
    if (!liveModeReady) return;
    setConfirmLiveOrder(true);
  };

  const submitConfirmedLiveOrder = async () => {
    if (!liveModeReady || !hasValidQuantity) return;
    try {
      await liveOrderMutation.mutateAsync({ broker: "binance", symbol, side: tradeSide, quantity: numericQuantity, price: orderType === "limit" ? Number(price) : currentPrice, dailyLossLimit: 1000, dailyLossUsed: 0, explicitConfirmation: true });
      setConfirmLiveOrder(false);
      setLiveOrderStatus("Live order submitted for broker execution.");
    } catch (error) {
      setConfirmLiveOrder(false);
      setLiveOrderStatus(error instanceof Error ? error.message : "Live order was rejected by the safety gate.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/65 backdrop-blur-xl"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><span className="status-dot bg-accent" /> Guarded execution workspace</div><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Trading</h1><p className="text-sm leading-6 text-muted-foreground">Market analysis and guarded order entry. Live execution stays locked until readiness checks pass.</p></div></header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><LiveQuotePanel symbol={symbol} ticker={ticker} /><OrderBook symbol={symbol} /></div>
        <RecentTrades symbol={streamSymbol} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-5 lg:col-span-2">
            <Card className="surface-glow border-white/10 bg-card/80"><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pre-flight review</p><h2 className="mt-1 text-lg font-bold text-foreground">Order preview</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Review notional value before staging a paper order or requesting live execution.</p></div><ShieldAlert className="h-5 w-5 shrink-0 text-accent" /></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl border border-white/5 bg-background/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Side</p><p className="mt-1 font-semibold text-foreground">{tradeSide}</p></div><div className="rounded-xl border border-white/5 bg-background/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Symbol</p><p className="mt-1 font-semibold text-foreground">{symbol}</p></div><div className="rounded-xl border border-white/5 bg-background/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Type</p><p className="mt-1 font-semibold text-foreground">{orderType.toUpperCase()}</p></div><div className="rounded-xl border border-white/5 bg-background/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Notional</p><p className="mt-1 font-semibold text-foreground">${orderValue.toFixed(2)}</p></div></div>{liveOrderStatus && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-background/40 p-3 text-sm leading-6 text-muted-foreground">{liveOrderStatus}</p>}</div></Card>
            <Card className="border-amber-500/30 bg-amber-500/[0.06]"><div className="flex items-start gap-3 p-5 sm:p-6"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" /><div><h2 className="font-semibold text-amber-200">Live execution is locked</h2><p className="mt-1 text-sm leading-6 text-amber-200/75">This account has no verified broker credentials. Placeholder fields never submit an order, so only paper order staging is available.</p><Button type="button" onClick={handleLiveOrderRequest} disabled={!liveModeReady} className="touch-target mt-4 min-h-11 bg-muted text-muted-foreground">{liveModeReady ? "Review live order" : "Configure broker to review live order"}</Button></div></div></Card>
          </div>

          <Card className="surface-glow border-white/10 bg-card/80"><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Paper desk</p><h2 className="mt-1 text-lg font-bold text-foreground">Place order</h2></div><span className={`text-xs font-semibold ${ticker.status === "live" ? "text-green-400" : "text-amber-400"}`}>{ticker.status === "live" ? "Live quote" : ticker.status}</span></div><Tabs value={tradeSide.toLowerCase()} onValueChange={(value) => setTradeSide(value === "sell" ? "SELL" : "BUY")}><TabsList className="mt-5 grid h-11 w-full grid-cols-2"><TabsTrigger value="buy">Buy</TabsTrigger><TabsTrigger value="sell">Sell</TabsTrigger></TabsList>{(["buy", "sell"] as const).map((side) => <TabsContent key={side} value={side} className="mt-5 space-y-4"><div><div className="flex items-center justify-between"><label htmlFor="coin" className="text-sm font-semibold text-foreground">Coin</label><span className="text-xs text-muted-foreground">{ticker.status}</span></div><select id="coin" value={selectedCoin} onChange={(event) => setSelectedCoin(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"><option value="bitcoin">Bitcoin (BTC)</option><option value="ethereum">Ethereum (ETH)</option><option value="cardano">Cardano (ADA)</option></select></div><div><label htmlFor="order-type" className="text-sm font-semibold text-foreground">Order type</label><select id="order-type" value={orderType} onChange={(event) => setOrderType(event.target.value as OrderType)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"><option value="market">Market</option><option value="limit">Limit</option></select></div><div><label htmlFor="quantity" className="text-sm font-semibold text-foreground">Quantity</label><Input id="quantity" type="number" min="0" step="any" inputMode="decimal" placeholder="0.00" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 min-h-12 border-white/10 bg-background/60" /></div>{orderType === "limit" && <div><label htmlFor="price" className="text-sm font-semibold text-foreground">Limit price</label><Input id="price" type="number" min="0" step="any" inputMode="decimal" placeholder="0.00" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2 min-h-12 border-white/10 bg-background/60" /></div>}<Button className={`touch-target min-h-11 w-full ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`} onClick={handlePlacePaperOrder}><CheckCircle2 className="mr-2 h-4 w-4" />Stage paper {side} order</Button></TabsContent>)}</Tabs></div></Card>
        </div>
      </main>

      {confirmLiveOrder && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center sm:p-4"><Card className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto border-red-500/50 bg-card"><div className="p-5 sm:p-6"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-400" /><div><h2 className="text-xl font-bold text-red-300">Confirm this real order</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">This confirmation applies to this order only. If accepted, the app will send explicit confirmation to the server-side live-order safety gate.</p></div></div><div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-background/40 p-4 text-sm text-foreground"><p><span className="text-muted-foreground">Order:</span> {tradeSide} {quantity || "0"} {symbol}</p><p><span className="text-muted-foreground">Estimated notional:</span> ${orderValue.toFixed(2)}</p><p><span className="text-muted-foreground">Daily loss limit:</span> $1,000</p></div><div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"><Button type="button" variant="outline" className="min-h-11" onClick={() => setConfirmLiveOrder(false)}>Cancel</Button><Button type="button" className="min-h-11 bg-red-600 text-white hover:bg-red-700" onClick={submitConfirmedLiveOrder} disabled={liveOrderMutation.isPending}>I understand — submit order</Button></div></div></Card></div>}
    </div>
  );
}
