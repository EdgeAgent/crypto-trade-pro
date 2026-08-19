import React, { useState } from "react";
import { AlertCircle, Pause, Play, Square, Trash2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import BotBuilder, { type BotDraft } from "@/components/BotBuilder";
import { transitionBotStatus, type BotStatus } from "../../../shared/botLifecycle";

interface BotRecord extends BotDraft {
  id: string;
  status: BotStatus;
  createdAt: string;
}

export default function Bots() {
  const [bots, setBots] = useState<BotRecord[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const createBot = (draft: BotDraft) => {
    const bot: BotRecord = { ...draft, id: crypto.randomUUID(), status: "staged", createdAt: new Date().toISOString() };
    setBots((current) => [bot, ...current]);
    setNotice(`${draft.name} staged successfully. No orders will be submitted until broker credentials, a risk policy, and GO LIVE confirmation are present.`);
  };

  const toggleBot = (id: string) => setBots((current) => current.map((bot) => bot.id === id ? { ...bot, status: transitionBotStatus(bot.status, bot.status === "active" ? "pause" : "resume") } : bot));
  const activateBot = (id: string) => setBots((current) => current.map((bot) => bot.id === id ? { ...bot, status: transitionBotStatus(bot.status, bot.status === "stopped" ? "restart" : "activate") } : bot));
  const stopBot = (id: string) => setBots((current) => current.map((bot) => bot.id === id ? { ...bot, status: transitionBotStatus(bot.status, "stop") } : bot));
  const deleteBot = (id: string) => setBots((current) => current.filter((bot) => bot.id !== id));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"><div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8"><h1 className="text-2xl font-bold text-foreground">Trading Bots</h1><p className="text-sm text-muted-foreground mt-1">Build, validate, and stage strategy configurations with explicit execution gates.</p></div></div>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {notice && <Card className="border-accent/40 bg-accent/5 p-4"><p className="text-sm text-accent">{notice}</p></Card>}
        <BotBuilder onCreate={createBot} />
        {bots.length === 0 ? <Card className="border-dashed border-border bg-card"><div className="p-12 text-center"><AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold text-foreground">No staged bots yet</h2><p className="mt-2 text-sm text-muted-foreground">Create a validated strategy above to add it to this workspace.</p></div></Card> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{bots.map((bot) => <Card key={bot.id} className="border-border/50 bg-card"><div className="p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-foreground">{bot.name}</h3><p className="text-sm text-muted-foreground">{bot.strategy} · {bot.symbol}</p></div><Badge variant="outline" className={bot.status === "staged" ? "border-amber-500/40 text-amber-400" : bot.status === "active" ? "border-green-500/40 text-green-400" : bot.status === "stopped" ? "border-red-500/40 text-red-400" : "border-border text-muted-foreground"}>{bot.status.toUpperCase()}</Badge></div><div className="mt-5 grid grid-cols-3 gap-3 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm"><div><p className="text-xs text-muted-foreground">Allocation</p><p className="mt-1 font-semibold text-foreground">{bot.allocation}%</p></div><div><p className="text-xs text-muted-foreground">Stop loss</p><p className="mt-1 font-semibold text-foreground">{bot.stopLoss}%</p></div><div><p className="text-xs text-muted-foreground">Take profit</p><p className="mt-1 font-semibold text-foreground">{bot.takeProfit}%</p></div></div><div className="mt-5 flex items-center justify-between"><div className="flex items-center gap-3"><Switch checked={bot.status === "active"} disabled={bot.status === "staged" || bot.status === "stopped"} onCheckedChange={() => toggleBot(bot.id)} /><span className="text-sm text-muted-foreground">{bot.status === "active" ? "Enabled" : bot.status === "paused" ? "Paused" : bot.status === "stopped" ? "Stopped" : "Staged only"}</span></div><div className="flex gap-2">{bot.status === "staged" && <Button variant="outline" size="sm" onClick={() => activateBot(bot.id)}><Play className="mr-1 h-4 w-4" />Activate</Button>}{bot.status === "active" && <Button variant="outline" size="sm" onClick={() => toggleBot(bot.id)}><Pause className="mr-1 h-4 w-4" />Pause</Button>}{bot.status === "paused" && <Button variant="outline" size="sm" onClick={() => toggleBot(bot.id)}><Play className="mr-1 h-4 w-4" />Resume</Button>}{bot.status === "stopped" && <Button variant="outline" size="sm" onClick={() => activateBot(bot.id)}><Play className="mr-1 h-4 w-4" />Restart</Button>}{(bot.status === "active" || bot.status === "paused") && <Button variant="outline" size="sm" onClick={() => stopBot(bot.id)}><Square className="mr-1 h-4 w-4" />Stop</Button>}<Button variant="outline" size="sm"><TrendingUp className="mr-1 h-4 w-4" />Details</Button><Button variant="outline" size="sm" className="text-red-400 hover:bg-red-500/10" onClick={() => deleteBot(bot.id)}><Trash2 className="h-4 w-4" /></Button></div></div></div></Card>)}</div>}
      </div>
    </div>
  );
}
