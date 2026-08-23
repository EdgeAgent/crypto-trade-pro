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
  const [fundAmount, setFundAmount] = useState("");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editLimitPrice, setEditLimitPrice] = useState("");

  const utils = trpc.useUtils();
  const paperAccountQuery = trpc.trading.getPaperAccount.useQuery(undefined, { retry: false });
  const paperOrdersQuery = trpc.trading.getPendingOrders.useQuery(undefined, { retry: false });
  const paperPositionsQuery = trpc.trading.getPositions.useQuery(undefined, { retry: false });
  const paperTradesQuery = trpc.trading.getTradeHistory.useQuery(undefined, { retry: false });
  const fundPaperAccountMutation = trpc.trading.fundPaperAccount.useMutation({ onSuccess: () => { setFundAmount(""); void utils.trading.getPaperAccount.invalidate(); } });
  const marketOrderMutation = trpc.trading.placeMarketOrder.useMutation({ onSuccess: () => { void Promise.all([utils.trading.getPaperAccount.invalidate(), utils.trading.getPositions.invalidate(), utils.trading.getTradeHistory.invalidate()]); } });
  const limitOrderMutation = trpc.trading.placeLimitOrder.useMutation({ onSuccess: () => { void utils.trading.getPendingOrders.invalidate(); } });
  const modifyOrderMutation = trpc.trading.modifyOrder.useMutation({ onSuccess: () => { setEditingOrderId(null); void utils.trading.getPendingOrders.invalidate(); } });
  const cancelOrderMutation = trpc.trading.cancelOrder.useMutation({ onSuccess: () => { void utils.trading.getPendingOrders.invalidate(); } });
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

  const handlePlacePaperOrder = async () => {
    if (!hasValidQuantity) {
      setLiveOrderStatus("Enter a quantity greater than zero before placing this paper order.");
      return;
    }
    if (orderType === "market" && currentPrice <= 0) {
      setLiveOrderStatus("A live quote is required before a paper market order can fill.");
      return;
    }
    if (orderType === "limit" && (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
      setLiveOrderStatus("Enter a limit price greater than zero before placing this paper order.");
      return;
    }
    try {
      const result = orderType === "market"
        ? await marketOrderMutation.mutateAsync({ symbol, side: tradeSide, quantity: numericQuantity, price: currentPrice })
        : await limitOrderMutation.mutateAsync({ symbol, side: tradeSide, quantity: numericQuantity, limitPrice: Number(price) });
      setLiveOrderStatus(`${result.message} Order ${result.id}.`);
    } catch (error) {
      setLiveOrderStatus(error instanceof Error ? error.message : "Paper order was rejected.");
    }
  };

  const handleModifyOrder = async () => {
    if (!editingOrderId) return;
    const nextQuantity = Number(editQuantity);
    const nextPrice = Number(editLimitPrice);
    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0 || !Number.isFinite(nextPrice) || nextPrice <= 0) {
      setLiveOrderStatus("Enter positive quantity and limit price values before saving the order.");
      return;
    }
    try {
      await modifyOrderMutation.mutateAsync({ orderId: editingOrderId, quantity: nextQuantity, limitPrice: nextPrice });
      setLiveOrderStatus(`Paper limit order ${editingOrderId} updated.`);
    } catch (error) {
      setLiveOrderStatus(error instanceof Error ? error.message : "Paper order could not be modified.");
    }
  };

  const handleFundPaperAccount = async () => {
    const amount = Number(fundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setLiveOrderStatus("Enter a positive amount to fund the paper account.");
      return;
    }
    try {
      const result = await fundPaperAccountMutation.mutateAsync({ amount });
      setLiveOrderStatus(`Paper account funded with $${amount.toFixed(2)}. New cash balance: $${result.cashBalance.toFixed(2)}.`);
    } catch (error) {
      setLiveOrderStatus(error instanceof Error ? error.message : "Paper account funding failed.");
    }
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-white/10 bg-card/80"><div className="p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Paper account</p><p className="mt-2 text-3xl font-bold text-foreground">${(paperAccountQuery.data?.cashBalance ?? 0).toFixed(2)}</p><p className="mt-1 text-sm text-muted-foreground">Explicitly funded cash balance. No starting balance is created automatically.</p><div className="mt-4 flex gap-2"><Input aria-label="Fund paper account amount" type="number" min="0" step="any" inputMode="decimal" placeholder="Amount" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} className="min-h-11 border-white/10 bg-background/60" /><Button type="button" className="min-h-11 shrink-0 bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={handleFundPaperAccount} disabled={fundPaperAccountMutation.isPending}>Fund</Button></div></div></Card>
          <Card className="border-white/10 bg-card/80"><div className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Open limits</p><h2 className="mt-1 text-lg font-bold text-foreground">Pending orders</h2></div><span className="text-sm text-muted-foreground">{paperOrdersQuery.data?.orders.length ?? 0}</span></div><div className="mt-4 space-y-2">{paperOrdersQuery.data?.orders.length ? paperOrdersQuery.data.orders.map((order) => <div key={order.id} className="rounded-xl border border-white/10 bg-background/40 p-3 text-sm"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-foreground">{order.side} {order.quantity} {order.symbol}</p><p className="text-muted-foreground">Limit ${order.limitPrice.toFixed(2)}</p></div><div className="flex gap-2"><Button type="button" variant="outline" className="min-h-10" onClick={() => { setEditingOrderId(order.id); setEditQuantity(String(order.quantity)); setEditLimitPrice(String(order.limitPrice)); }} disabled={modifyOrderMutation.isPending}>Edit</Button><Button type="button" variant="outline" className="min-h-10" onClick={() => cancelOrderMutation.mutate({ orderId: order.id })} disabled={cancelOrderMutation.isPending}>Cancel</Button></div></div>{editingOrderId === order.id && <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"><Input aria-label="Edit order quantity" type="number" min="0" step="any" value={editQuantity} onChange={(event) => setEditQuantity(event.target.value)} className="min-h-10 border-white/10 bg-background/60" /><Input aria-label="Edit order limit price" type="number" min="0" step="any" value={editLimitPrice} onChange={(event) => setEditLimitPrice(event.target.value)} className="min-h-10 border-white/10 bg-background/60" /><Button type="button" className="min-h-10 bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={handleModifyOrder} disabled={modifyOrderMutation.isPending}>Save</Button></div>}</div>) : <p className="text-sm leading-6 text-muted-foreground">No open paper limit orders.</p>}</div></div></Card>
          <Card className="border-white/10 bg-card/80"><div className="p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ledger snapshot</p><h2 className="mt-1 text-lg font-bold text-foreground">Positions & fills</h2><div className="mt-4 space-y-3">{paperPositionsQuery.data?.positions.length ? paperPositionsQuery.data.positions.map((position) => { const mark = position.symbol === symbol && currentPrice > 0 ? currentPrice : null; const unrealized = mark === null ? null : (mark - position.entryPrice) * position.quantity; return <div key={position.symbol} className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-foreground">{position.symbol}</span><span className="text-right text-muted-foreground">{position.quantity} @ ${position.entryPrice.toFixed(2)}<br />{mark === null ? "mark pending" : `Mark $${mark.toFixed(2)} · ${unrealized! >= 0 ? "+" : ""}$${unrealized!.toFixed(2)}`}</span></div>; }) : <p className="text-sm text-muted-foreground">No open paper positions.</p>}<div className="border-t border-white/10 pt-3"><p className="text-sm text-muted-foreground">{paperTradesQuery.data?.length ?? 0} persisted fills. Market data marks unrealized P&L only when a current quote is available.</p>{paperTradesQuery.data?.length ? <div className="mt-3 space-y-2">{paperTradesQuery.data.slice(0, 5).map((trade) => <div key={trade.id} className="rounded-lg border border-white/5 p-2 text-xs"><div className="flex justify-between gap-2"><span className="font-semibold text-foreground">{trade.side} {trade.quantity} {trade.symbol}</span><span className="text-muted-foreground">{new Date(trade.createdAt).toLocaleString()}</span></div><div className="mt-1 flex justify-between gap-2 text-muted-foreground"><span>Fill ${trade.price.toFixed(2)} · ${trade.totalValue.toFixed(2)}</span><span>Realized ${trade.realizedPnl.toFixed(2)}</span></div></div>)}</div> : null}</div></div></div></Card>
        </div>
      </main>

      {confirmLiveOrder && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center sm:p-4"><Card className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto border-red-500/50 bg-card"><div className="p-5 sm:p-6"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-400" /><div><h2 className="text-xl font-bold text-red-300">Confirm this real order</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">This confirmation applies to this order only. If accepted, the app will send explicit confirmation to the server-side live-order safety gate.</p></div></div><div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-background/40 p-4 text-sm text-foreground"><p><span className="text-muted-foreground">Order:</span> {tradeSide} {quantity || "0"} {symbol}</p><p><span className="text-muted-foreground">Estimated notional:</span> ${orderValue.toFixed(2)}</p><p><span className="text-muted-foreground">Daily loss limit:</span> $1,000</p></div><div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"><Button type="button" variant="outline" className="min-h-11" onClick={() => setConfirmLiveOrder(false)}>Cancel</Button><Button type="button" className="min-h-11 bg-red-600 text-white hover:bg-red-700" onClick={submitConfirmedLiveOrder} disabled={liveOrderMutation.isPending}>I understand — submit order</Button></div></div></Card></div>}
    </div>
  );
}
