import React, { useMemo, useState } from "react";
import { AlertCircle, Pause, Play, RefreshCw, Square, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import BotBuilder, { type BotDraft } from "@/components/BotBuilder";
import BotPerformancePanel from "@/components/BotPerformancePanel";
import { type BotStatus } from "../../../shared/botLifecycle";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface BotRecord extends BotDraft {
  id: string;
  status: BotStatus;
  createdAt: Date;
}

export default function Bots() {
  const { isAuthenticated } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  const botsQuery = trpc.bots.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const refreshBots = () => void botsQuery.refetch();
  const createMutation = trpc.bots.create.useMutation({ onSuccess: (result) => { setNotice(result.message); refreshBots(); }, onError: (error) => setNotice(error.message) });
  const transitionMutation = trpc.bots.transition.useMutation({ onSuccess: (result) => { setNotice(`Bot is now ${result.status}.`); refreshBots(); }, onError: (error) => setNotice(error.message) });
  const bots = useMemo<BotRecord[]>(() => (botsQuery.data?.bots ?? []).map((bot) => ({ id: bot.id, name: bot.name, strategy: bot.strategy, symbol: bot.symbol, allocation: bot.allocation, stopLoss: bot.stopLoss, takeProfit: bot.takeProfit, status: bot.status, createdAt: bot.createdAt })), [botsQuery.data]);

  const createBot = (draft: BotDraft) => createMutation.mutate(draft);
  const transition = (id: string, action: "activate" | "pause" | "resume" | "stop" | "restart") => transitionMutation.mutate({ id, action });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/65 backdrop-blur-xl"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><span className="status-dot bg-accent" /> Controlled automation</div><h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Trading bots</h1><p className="text-sm leading-6 text-muted-foreground">Build, validate, and stage strategy configurations with explicit execution gates.</p></div></header>
      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {!isAuthenticated ? <Card className="border-dashed border-white/15 bg-card/70 p-8 text-center"><h2 className="font-semibold text-foreground">Connect your account to persist strategy bots</h2><p className="mt-2 text-sm text-muted-foreground">Bot drafts are not stored in the browser as a substitute for a user account.</p></Card> : <>
          {notice && <Card role="status" className="border-accent/30 bg-accent/[0.06] p-4 text-sm leading-6 text-accent">{notice}</Card>}
          <BotBuilder onCreate={createBot} />
          <BotPerformancePanel />
          {botsQuery.isLoading ? <Card className="border-white/10 bg-card/70 p-10 text-center"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-accent" /><p className="mt-3 text-sm text-muted-foreground">Loading persisted bot configurations…</p></Card> : botsQuery.isError ? <Card className="border-red-500/30 bg-red-500/[0.06] p-6"><h2 className="font-semibold text-red-300">Bot registry unavailable</h2><p className="mt-2 text-sm leading-6 text-red-200/80">{botsQuery.error.message}</p><Button type="button" variant="outline" className="mt-4 min-h-11" onClick={refreshBots}>Retry registry</Button></Card> : bots.length === 0 ? <Card className="border-dashed border-white/15 bg-card/70"><div className="p-10 text-center"><AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold text-foreground">No staged bots yet</h2><p className="mt-2 text-sm text-muted-foreground">Create a validated strategy above to persist it to this workspace.</p></div></Card> : <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{bots.map((bot) => <Card key={bot.id} className="interactive-lift border-white/10 bg-card/75"><div className="flex h-full flex-col p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="truncate text-lg font-bold text-foreground">{bot.name}</h3><p className="truncate text-sm text-muted-foreground">{bot.strategy} · {bot.symbol}</p></div><Badge variant="outline" className={bot.status === "staged" ? "shrink-0 border-amber-500/40 text-amber-400" : bot.status === "active" ? "shrink-0 border-green-500/40 text-green-400" : bot.status === "stopped" ? "shrink-0 border-red-500/40 text-red-400" : "shrink-0 border-white/15 text-muted-foreground"}>{bot.status.toUpperCase()}</Badge></div><div className="my-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-background/40 p-4 text-sm"><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Allocation</p><p className="mt-1 font-semibold text-foreground">{bot.allocation}%</p></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Stop loss</p><p className="mt-1 font-semibold text-foreground">{bot.stopLoss}%</p></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Take profit</p><p className="mt-1 font-semibold text-foreground">{bot.takeProfit}%</p></div></div><div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Switch checked={bot.status === "active"} disabled={bot.status === "staged" || bot.status === "stopped" || transitionMutation.isPending} onCheckedChange={() => transition(bot.id, bot.status === "active" ? "pause" : "resume")} /><span className="text-sm text-muted-foreground">{bot.status === "active" ? "Enabled" : bot.status === "paused" ? "Paused" : bot.status === "stopped" ? "Stopped" : "Staged only"}</span></div><div className="grid grid-cols-2 gap-2 sm:flex">{bot.status === "staged" && <Button variant="outline" className="min-h-11" onClick={() => transition(bot.id, "activate")} disabled={transitionMutation.isPending}><Play className="mr-1 h-4 w-4" />Activate</Button>}{bot.status === "active" && <Button variant="outline" className="min-h-11" onClick={() => transition(bot.id, "pause")} disabled={transitionMutation.isPending}><Pause className="mr-1 h-4 w-4" />Pause</Button>}{bot.status === "paused" && <Button variant="outline" className="min-h-11" onClick={() => transition(bot.id, "resume")} disabled={transitionMutation.isPending}><Play className="mr-1 h-4 w-4" />Resume</Button>}{bot.status === "stopped" && <Button variant="outline" className="min-h-11" onClick={() => transition(bot.id, "restart")} disabled={transitionMutation.isPending}><Play className="mr-1 h-4 w-4" />Restart</Button>}{(bot.status === "active" || bot.status === "paused") && <Button variant="outline" className="min-h-11" onClick={() => transition(bot.id, "stop")} disabled={transitionMutation.isPending}><Square className="mr-1 h-4 w-4" />Stop</Button>}<Button type="button" variant="outline" className="min-h-11" disabled title="Bot execution logs are not connected yet"><TrendingUp className="mr-1 h-4 w-4" />Logs unavailable</Button></div></div></div></Card>)}</div>}
        </>}
      </main>
    </div>
  );
}
