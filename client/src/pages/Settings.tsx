import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GoLiveSwitch from "@/components/GoLiveSwitch";
import RiskDashboard from "@/components/RiskDashboard";
import PerformanceAnalytics from "@/components/PerformanceAnalytics";
import { trpc } from "@/lib/trpc";

type Broker = "binance" | "coinbase" | "kraken";

const brokerDetails: Record<Broker, { label: string; description: string; fields: string[] }> = {
  binance: {
    label: "Binance",
    description: "High-liquidity spot markets with broad global asset coverage.",
    fields: ["API key", "API secret"],
  },
  coinbase: {
    label: "Coinbase Advanced",
    description: "US-focused spot trading with Advanced Trade credentials.",
    fields: ["API key", "API secret", "Passphrase"],
  },
  kraken: {
    label: "Kraken",
    description: "Spot trading connectivity with granular API permissions.",
    fields: ["API key", "API secret"],
  },
};

const modelOptions = [
  { value: "nvidia/nemotron-3-8b-chat", label: "NVIDIA Nemotron 3 8B", note: "Recommended for structured market analysis" },
  { value: "mistralai/mistral-7b-instruct", label: "Mistral 7B Instruct", note: "Free-tier friendly" },
  { value: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B Instruct", note: "Free-tier friendly" },
  { value: "qwen/qwen-2.5-7b-instruct", label: "Qwen 2.5 7B Instruct", note: "Free-tier friendly" },
];

function SecretField({ label, placeholder }: { label: string; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative mt-2">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="bg-muted border-border pr-10"
        />
        <button
          type="button"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function BrokerPlaceholderCard({ broker }: { broker: Broker }) {
  const details = brokerDetails[broker];

  return (
    <Card className="border-border/50 bg-card">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{details.label}</h3>
              <Badge variant="outline" className="border-amber-500/40 text-amber-400">Placeholder</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{details.description}</p>
          </div>
          <KeyRound className="h-5 w-5 text-accent" />
        </div>

        <div className="mt-5 space-y-4">
          {details.fields.map((field) => (
            <SecretField key={field} label={field} placeholder={`Paste ${details.label} ${field.toLowerCase()} here`} />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole className="h-3.5 w-3.5" />
            <span>UI placeholder only · not connected</span>
          </div>
          <Button type="button" variant="outline" size="sm" disabled>
            Validate later
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Settings() {
  const [activeBroker, setActiveBroker] = useState<Broker>("binance");
  const [model, setModel] = useState(modelOptions[0]?.value ?? "");
  const [dailyLossLimit, setDailyLossLimit] = useState("1000");
  const [maxPositionSize, setMaxPositionSize] = useState("5");
  const [saved, setSaved] = useState(false);

  const savePreferences = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure live-trading readiness, risk controls, and AI preferences.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Card className="border-blue-500/30 bg-blue-500/5">
          <div className="p-5 flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-blue-400 shrink-0" />
            <div>
              <h2 className="font-semibold text-blue-300">Live mode is gated until configuration is complete</h2>
              <p className="mt-1 text-sm leading-6 text-blue-200/80">
                The fields below are interface placeholders for users who will connect their own broker later. No placeholder value is sent to an exchange, and the GO LIVE control must remain locked until a broker is securely configured, the daily loss limit is valid, and the user explicitly confirms real-capital risk.
              </p>
            </div>
          </div>
        </Card>

        <GoLiveSwitch />

        <RiskDashboard
          dailyLossLimit={Number(dailyLossLimit) || 0}
          dailyLossUsed={null}
          brokerConnected={false}
          maxPositionSize={Number(maxPositionSize) || 0}
        />

        <PerformanceAnalyticsBrokerSection />
        <AuditActivityPanel />

        <Card className="border-border/50 bg-card">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Broker connections</h2>
                  <Badge variant="outline" className="border-border text-muted-foreground">BYOK</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Choose the primary venue and enter credentials only when you are ready to connect it.</p>
              </div>
              <ShieldCheck className="h-6 w-6 text-accent" />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-lg bg-muted/30 p-1">
              {(Object.keys(brokerDetails) as Broker[]).map((broker) => (
                <button
                  key={broker}
                  type="button"
                  onClick={() => setActiveBroker(broker)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeBroker === broker ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  {brokerDetails[broker].label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <BrokerPlaceholderCard broker={activeBroker} />
            </div>

            <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400 shrink-0" />
              <p>Use API keys with trading permission only. Disable withdrawals, restrict IPs where supported, and start with a sandbox/testnet account.</p>
            </div>
          </div>
        </Card>

        <Card className="border-border/50 bg-card">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">AI signal model</h2>
                <p className="mt-1 text-sm text-muted-foreground">OpenRouter model selection for advisory market analysis. Signals do not place orders by themselves.</p>
              </div>
              <Sparkles className="h-6 w-6 text-accent" />
            </div>

            <div className="mt-5 space-y-4">
              <SecretField label="OpenRouter API key (placeholder)" placeholder="Paste OpenRouter API key when connecting AI" />
              <div>
                <label htmlFor="ai-model" className="text-sm font-medium text-foreground">Preferred model</label>
                <select
                  id="ai-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="mt-2 flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                >
                  {modelOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label} — {option.note}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Selected model</p>
                <p className="mt-1">{modelOptions.find((option) => option.value === model)?.label ?? "No model selected"}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border/50 bg-card">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground">Risk management</h2>
            <p className="mt-1 text-sm text-muted-foreground">These limits are mandatory before live execution can be enabled.</p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="max-position" className="text-sm font-medium text-foreground">Maximum position size (%)</label>
                <Input id="max-position" type="number" min="0.1" max="100" value={maxPositionSize} onChange={(event) => setMaxPositionSize(event.target.value)} className="mt-2 bg-muted border-border" />
                <p className="mt-2 text-xs text-muted-foreground">Maximum portion of the connected account allocated to one position.</p>
              </div>
              <div>
                <label htmlFor="daily-loss" className="text-sm font-medium text-foreground">Daily loss limit (USD)</label>
                <Input id="daily-loss" type="number" min="1" value={dailyLossLimit} onChange={(event) => setDailyLossLimit(event.target.value)} className="mt-2 bg-muted border-border" />
                <p className="mt-2 text-xs text-muted-foreground">Trading should pause automatically when realized and unrealized losses reach this threshold.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border/50 pt-5">
              <div className="text-sm text-muted-foreground">Configured limit: <span className="font-semibold text-foreground">${Number(dailyLossLimit || 0).toLocaleString()}</span> daily</div>
              <Button type="button" onClick={savePreferences} className="bg-accent hover:bg-accent/90 text-accent-foreground">Save preferences</Button>
            </div>
            {saved && <p className="mt-3 text-sm text-green-400">Preferences saved locally for this session. Backend persistence will be enabled when broker connectivity is configured.</p>}
          </div>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <div className="p-5">
            <h2 className="font-semibold text-red-300">Real-capital disclosure</h2>
            <p className="mt-1 text-sm leading-6 text-red-200/80">
              Live crypto trading can lose the full amount allocated and may incur fees, slippage, outages, and execution risk. Keep withdrawals disabled on API keys, review every strategy, and never use funds you cannot afford to lose.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AuditActivityPanel() {
  let events: Array<{ id: string; eventType: string; outcome: "allowed" | "rejected" | "unavailable"; broker: string | null; symbol: string | null; message: string; createdAt: Date }> = [];
  let loading = false;
  try {
    const query = trpc.audit.listRecent.useQuery({ limit: 8 }, { retry: false, refetchOnWindowFocus: false });
    events = query.data ?? [];
    loading = query.isLoading;
  } catch {
    events = [];
  }
  return <Card className="border-border/50 bg-card"><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-accent" /><h2 className="text-xl font-bold text-foreground">Safety activity</h2></div><p className="mt-1 text-sm leading-6 text-muted-foreground">Redacted order-gate outcomes for this account. API keys and secrets are never recorded.</p></div><Badge variant="outline" className="border-border text-muted-foreground">Audit log</Badge></div>{loading ? <p className="mt-5 text-sm text-muted-foreground">Loading safety activity…</p> : events.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm leading-6 text-muted-foreground">No safety events have been recorded for this account.</div> : <div className="mt-5 space-y-3">{events.map((event) => <div key={event.id} className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-medium text-foreground">{event.message}</p><p className="mt-1 text-xs text-muted-foreground">{event.eventType}{event.broker ? ` · ${event.broker}` : ""}{event.symbol ? ` · ${event.symbol}` : ""}</p></div><Badge variant="outline" className={event.outcome === "rejected" ? "w-fit border-red-500/40 text-red-400" : "w-fit border-amber-500/40 text-amber-400"}>{event.outcome}</Badge></div>)}</div>}</div></Card>;
}

function PerformanceAnalyticsBrokerSection() {
  let trades: Array<{ id: string; side: "BUY" | "SELL"; price: number; quantity: number; realizedPnl?: number; timestamp: number }> = [];
  try {
    const tradesQuery = trpc.trading.getTradeHistory.useQuery(undefined, { retry: false, refetchOnWindowFocus: false, enabled: false });
    trades = (tradesQuery.data ?? []).map((t) => ({
      id: String(t.id),
      side: t.side,
      price: Number(t.price),
      quantity: Number(t.quantity),
      realizedPnl: Number(t.realizedPnl),
      timestamp: Number(t.timestamp),
    }));
  } catch {
    trades = [];
  }
  return <PerformanceAnalytics brokerConnected={false} trades={trades} />;
}

export { modelOptions };
