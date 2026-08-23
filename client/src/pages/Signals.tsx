import React from "react";
import { AlertTriangle, Radio, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SignalFeed from "@/components/SignalFeed";

export default function Signals() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/65 backdrop-blur-xl"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><span className="status-dot bg-accent" /> Advisory desk</div><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Trading signals</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Provider-backed advisory signals with explicit execution boundaries. No signal can place an order by itself.</p></div><Badge variant="outline" className="w-fit border-accent/25 bg-accent/[0.06] text-accent"><Radio className="mr-2 h-3 w-3" /> Provider status</Badge></div></div></header>
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-blue-400/20 bg-blue-400/[0.06]"><div className="flex items-start gap-3 p-5 sm:p-6"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" /><div><p className="text-sm font-semibold text-blue-100">Research, not a promise</p><p className="mt-1 text-sm leading-6 text-blue-100/70">AI output is informational and may be wrong. It does not guarantee returns and does not place orders. Any future execution requires a verified broker, risk gates, and separate per-order confirmation.</p></div><ShieldCheck className="ml-auto hidden h-5 w-5 shrink-0 text-blue-300/70 sm:block" /></div></Card>
        <SignalFeed />
      </main>
    </div>
  );
}
