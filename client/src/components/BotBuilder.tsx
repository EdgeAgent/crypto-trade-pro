import React, { useMemo, useState } from "react";
import { Bot, CheckCircle2, CircleAlert, Save } from "lucide-react";
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
    <Card className="border-border/50 bg-card"><div className="p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-foreground">Strategy bot builder</h2><p className="mt-1 text-sm text-muted-foreground">Configure a staged strategy. Bot execution remains disabled until a broker and policy are explicitly enabled.</p></div><Bot className="h-6 w-6 text-accent" /></div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="space-y-4"><div><label className="text-sm text-muted-foreground">Bot name</label><Input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="BTC trend pilot" className="mt-2 bg-muted border-border" /></div><div><label className="text-sm text-muted-foreground">Trading pair</label><Input value={draft.symbol} onChange={(event) => update("symbol", event.target.value.toUpperCase())} className="mt-2 bg-muted border-border" /></div><div><label className="text-sm text-muted-foreground">Strategy</label><select value={draft.strategy} onChange={(event) => update("strategy", event.target.value)} className="mt-2 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">{strategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.label}</option>)}</select></div></div><div className="space-y-4"><div><label className="text-sm text-muted-foreground">Allocation (%)</label><Input type="number" min="0.1" max="25" step="0.1" value={draft.allocation} onChange={(event) => update("allocation", Number(event.target.value))} className="mt-2 bg-muted border-border" /></div><div><label className="text-sm text-muted-foreground">Stop loss (%)</label><Input type="number" min="0.1" max="50" step="0.1" value={draft.stopLoss} onChange={(event) => update("stopLoss", Number(event.target.value))} className="mt-2 bg-muted border-border" /></div><div><label className="text-sm text-muted-foreground">Take profit (%)</label><Input type="number" min="0.1" max="100" step="0.1" value={draft.takeProfit} onChange={(event) => update("takeProfit", Number(event.target.value))} className="mt-2 bg-muted border-border" /></div></div></div>
      <div className="mt-6 rounded-lg border border-border/50 bg-muted/20 p-4"><div className="flex items-center justify-between"><div><p className="font-medium text-foreground">Validation</p><p className="mt-1 text-sm text-muted-foreground">{validation.length ? "Resolve the items below before staging this bot." : "Configuration is valid for staging."}</p></div><Badge variant="outline" className={validation.length ? "border-red-500/40 text-red-400" : "border-green-500/40 text-green-400"}>{validation.length ? "Needs review" : "Ready"}</Badge></div>{validation.length ? <ul className="mt-3 space-y-2 text-sm text-red-300">{validation.map((issue) => <li key={issue} className="flex gap-2"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{issue}</li>)}</ul> : <p className="mt-3 flex items-center gap-2 text-sm text-green-300"><CheckCircle2 className="h-4 w-4" />Risk parameters pass the builder checks.</p>}</div>
      <div className="mt-6 flex justify-end"><Button disabled={validation.length > 0} onClick={() => onCreate(draft)} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="mr-2 h-4 w-4" />Stage bot</Button></div>
    </div></Card>
  );
}
