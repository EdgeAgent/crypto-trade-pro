import React, { useEffect } from "react";
import { Activity, AlertCircle, Radio, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function SignalFeed() {
  const signalsQuery = trpc.signals.list.useQuery(undefined, { refetchInterval: 30000 });
  const signals = signalsQuery.data?.signals ?? [];
  const refetchSignals = signalsQuery.refetch;

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;
    const stream = new EventSource("/api/signals/stream");
    const onSignal = () => { void refetchSignals(); };
    stream.addEventListener("signal", onSignal);
    return () => { stream.removeEventListener("signal", onSignal); stream.close(); };
  }, [refetchSignals]);

  if (signalsQuery.isLoading) return <Card className="border-border/50 bg-card p-10 text-center"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm text-muted-foreground">Loading provider-backed signals…</p></Card>;
  if (signalsQuery.isError) return <Card className="border-red-500/30 bg-red-500/5 p-6"><div className="flex items-start gap-3"><AlertCircle className="h-5 w-5 text-red-400" /><div><h2 className="font-semibold text-red-300">Signal provider unavailable</h2><p className="mt-1 text-sm text-red-200/80">{signalsQuery.error.message}</p><Button className="mt-4" variant="outline" onClick={() => signalsQuery.refetch()}>Retry</Button></div></div></Card>;

  return (
    <div className="space-y-5">
      <Card className="border-border/50 bg-card"><div className="p-6 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-xl font-bold text-foreground">Signal feed</h2><Badge variant="outline" className="border-amber-500/40 text-amber-400">{signalsQuery.data?.status ?? "Awaiting provider"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">Signals are advisory only and never submit an order without explicit user execution.</p></div><Radio className="h-6 w-6 text-accent" /></div></Card>
      {signals.length === 0 ? <Card className="border-dashed border-border bg-card"><div className="p-12 text-center"><Activity className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold text-foreground">No live signals available</h3><p className="mt-2 text-sm text-muted-foreground">{signalsQuery.data?.message ?? "Connect an advisory signal provider to populate this feed."}</p></div></Card> : <div className="space-y-4">{signals.map((signal) => <Card key={signal.id} className="border-border/50 bg-card"><div className="p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold text-foreground">{signal.symbol}</h3><p className="text-sm text-muted-foreground">{signal.type} · {signal.source}</p></div><Badge>{signal.confidence}% confidence</Badge></div><p className="mt-4 text-sm text-muted-foreground">{signal.reasoning}</p></div></Card>)}</div>}
    </div>
  );
}
