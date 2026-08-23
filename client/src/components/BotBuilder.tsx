import React, { useMemo, useState } from "react";
import { Bot, CheckCircle2, CircleAlert, Save, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface BotDraft {
  name: string;
  strategy: string;
  symbol: string;
  allocation: number;
  stopLoss: number;
  takeProfit: number;
}

interface BotBuilderProps {
  onCreate: (draft: BotDraft) => void;
}

const strategies = [
  { id: "trend-following", label: "Trend following", description: "Follow momentum with a moving-average confirmation." },
  { id: "mean-reversion", label: "Mean reversion", description: "Look for oversold/overbought reversion setups." },
  { id: "breakout", label: "Volatility breakout", description: "Stage entries when price escapes a defined range." },
];

export default function BotBuilder({ onCreate }: BotBuilderProps) {
  const [draft, setDraft] = useState<BotDraft>({ name: "", strategy: strategies[0].id, symbol: "BTCUSDT", allocation: 5, stopLoss: 2, takeProfit: 4 });
  const validation = useMemo(() => {
    const issues: string[] = [];
    if (draft.name.trim().length < 3) issues.push("Give the bot a name with at least 3 characters.");
    if (!/^[A-Z0-9]{6,12}$/.test(draft.symbol)) issues.push("Use an uppercase symbol such as BTCUSDT.");
    if (draft.allocation <= 0 || draft.allocation > 25) issues.push("Allocation must be between 0.1% and 25%.");
    if (draft.stopLoss <= 0 || draft.stopLoss >= 50) issues.push("Stop loss must be between 0.1% and 50%.");
    if (draft.takeProfit <= draft.stopLoss) issues.push("Take profit must exceed stop loss.");
    return issues;
  }, [draft]);

  const update = <K extends keyof BotDraft>(key: K, value: BotDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Card className="surface-glow border-white/10 bg-card/80">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Controlled automation</p><h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Strategy bot builder</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Configure a staged strategy. Bot execution remains disabled until a broker and policy are explicitly enabled.</p></div><Bot className="h-6 w-6 shrink-0 text-accent" /></div>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-4">
            <div><label htmlFor="bot-name" className="text-sm font-semibold text-foreground">Bot name</label><Input id="bot-name" value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="BTC trend pilot" className="mt-2 min-h-12 border-white/10 bg-background/60" /></div>
            <div><label htmlFor="bot-symbol" className="text-sm font-semibold text-foreground">Trading pair</label><Input id="bot-symbol" value={draft.symbol} onChange={(event) => update("symbol", event.target.value.toUpperCase())} className="mt-2 min-h-12 border-white/10 bg-background/60" /></div>
            <div><label htmlFor="bot-strategy" className="text-sm font-semibold text-foreground">Strategy</label><select id="bot-strategy" value={draft.strategy} onChange={(event) => update("strategy", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">{strategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.label}</option>)}</select><p className="mt-2 text-xs leading-5 text-muted-foreground">{strategies.find((strategy) => strategy.id === draft.strategy)?.description}</p></div>
          </div>
          <div className="space-y-4">
            <div><label htmlFor="bot-allocation" className="text-sm font-semibold text-foreground">Allocation (%)</label><Input id="bot-allocation" type="number" min="0.1" max="25" step="0.1" value={draft.allocation} onChange={(event) => update("allocation", Number(event.target.value))} className="mt-2 min-h-12 border-white/10 bg-background/60" /></div>
            <div><label htmlFor="bot-stop-loss" className="text-sm font-semibold text-foreground">Stop loss (%)</label><Input id="bot-stop-loss" type="number" min="0.1" max="50" step="0.1" value={draft.stopLoss} onChange={(event) => update("stopLoss", Number(event.target.value))} className="mt-2 min-h-12 border-white/10 bg-background/60" /></div>
            <div><label htmlFor="bot-take-profit" className="text-sm font-semibold text-foreground">Take profit (%)</label><Input id="bot-take-profit" type="number" min="0.1" max="100" step="0.1" value={draft.takeProfit} onChange={(event) => update("takeProfit", Number(event.target.value))} className="mt-2 min-h-12 border-white/10 bg-background/60" /></div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-background/35 p-4"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><p className="font-semibold text-foreground">Validation</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{validation.length ? "Resolve the items below before staging this bot." : "Configuration is valid for staging."}</p></div></div><Badge variant="outline" className={validation.length ? "shrink-0 border-red-500/40 text-red-400" : "shrink-0 border-green-500/40 text-green-400"}>{validation.length ? "Needs review" : "Ready"}</Badge></div>{validation.length ? <ul className="mt-4 space-y-2 text-sm text-red-300">{validation.map((issue) => <li key={issue} className="flex gap-2"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{issue}</li>)}</ul> : <p className="mt-4 flex items-center gap-2 text-sm text-green-300"><CheckCircle2 className="h-4 w-4" />Risk parameters pass the builder checks.</p>}</div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted-foreground">Staging never sends an order. Review the bot in its lifecycle panel before any execution is enabled.</p><Button disabled={validation.length > 0} onClick={() => onCreate(draft)} className="touch-target min-h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"><Save className="mr-2 h-4 w-4" />Stage bot</Button></div>
      </div>
    </Card>
  );
}
