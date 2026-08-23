import React, { useState } from "react";
import { AlertTriangle, BrainCircuit, Radio, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SignalFeed from "@/components/SignalFeed";
import { useLiveTicker } from "@/hooks/useLiveTicker";
import { canGenerateAdvisory } from "@/lib/liveTicker";
import { trpc } from "@/lib/trpc";

export default function Signals() {
  const [notice, setNotice] = useState<string | null>(null);
  const ticker = useLiveTicker("BTCUSDT");
  const utils = trpc.useUtils();
  const generateMutation = trpc.signals.generate.useMutation({ onSuccess: (result) => { setNotice(`${result.direction} advisory saved from ${result.model}. Advisory only; no order was submitted.`); void utils.signals.list.invalidate(); }, onError: (error) => setNotice(error.message) });
  const canGenerate = canGenerateAdvisory(ticker);

  const generateAdvisory = () => {
    if (!ticker.data) return;
    generateMutation.mutate({ symbol: "BTCUSDT", price: ticker.data.price, change24h: ticker.data.change24h, rsi: null, macd: null, bollingerPosition: null });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/65 backdrop-blur-xl"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><span className="status-dot bg-accent" /> Advisory desk</div><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Trading signals</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Provider-backed advisory signals with explicit execution boundaries. No signal can place an order by itself.</p></div><Badge variant="outline" className="w-fit border-accent/25 bg-accent/[0.06] text-accent"><Radio className="mr-2 h-3 w-3" /> Provider status</Badge></div></div></header>
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-blue-400/20 bg-blue-400/[0.06]"><div className="flex items-start gap-3 p-5 sm:p-6"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" /><div><p className="text-sm font-semibold text-blue-100">Research, not a promise</p><p className="mt-1 text-sm leading-6 text-blue-100/70">AI output is informational and may be wrong. It does not guarantee returns and does not place orders. Any future execution requires a verified broker, risk gates, and separate per-order confirmation.</p></div><ShieldCheck className="ml-auto hidden h-5 w-5 shrink-0 text-blue-300/70 sm:block" /></div></Card>
        <Card className="surface-glow border-white/10 bg-card/80"><div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-foreground">Generate advisory snapshot</h2><Badge variant="outline" className={canGenerate ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}>{canGenerate ? ticker.source === "websocket" ? "Live BTC · WebSocket" : "Live BTC · REST fallback" : "Waiting for live quote"}</Badge></div><p className="mt-1 text-sm leading-6 text-muted-foreground">Uses the current BTC/USDT provider quote and stores a time-limited advisory record. It never submits an order.</p>{ticker.data && <p className="mt-2 text-xs text-muted-foreground">Snapshot: ${ticker.data.price.toLocaleString()} · {ticker.data.change24h >= 0 ? "+" : ""}{ticker.data.change24h.toFixed(2)}%</p>}</div></div><Button type="button" className="min-h-11 w-full sm:w-auto" onClick={generateAdvisory} disabled={!canGenerate || generateMutation.isPending}><BrainCircuit className="mr-2 h-4 w-4" />{generateMutation.isPending ? "Analyzing…" : "Generate advisory"}</Button></div>{notice && <p role="status" className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-accent sm:px-6">{notice}</p>}</Card>
        <SignalFeed />
      </main>
    </div>
  );
}
