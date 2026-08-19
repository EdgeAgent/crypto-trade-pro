import React from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Gauge, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RiskDashboardProps {
  dailyLossLimit: number;
  dailyLossUsed: number | null;
  brokerConnected: boolean;
  maxPositionSize: number;
}

export default function RiskDashboard({ dailyLossLimit, dailyLossUsed, brokerConnected, maxPositionSize }: RiskDashboardProps) {
  const hasValidLimit = Number.isFinite(dailyLossLimit) && dailyLossLimit > 0;
  const utilization = hasValidLimit && dailyLossUsed !== null ? Math.min(Math.max((dailyLossUsed / dailyLossLimit) * 100, 0), 100) : null;
  const ready = brokerConnected && hasValidLimit;

  return (
    <Card className="border-border/50 bg-card">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Risk Dashboard</h2>
              <Badge variant="outline" className={ready ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}>
                {ready ? "Ready" : "Gated"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">The live-execution guardrail status for this account.</p>
          </div>
          <Gauge className="h-6 w-6 text-accent" />
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldAlert className="h-4 w-4" /> Broker status</div>
            <p className={`mt-2 font-semibold ${brokerConnected ? "text-green-400" : "text-amber-400"}`}>{brokerConnected ? "Verified" : "Not connected"}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleAlert className="h-4 w-4" /> Daily loss limit</div>
            <p className={`mt-2 font-semibold ${hasValidLimit ? "text-foreground" : "text-red-400"}`}>{hasValidLimit ? `$${dailyLossLimit.toLocaleString()}` : "Invalid"}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-4 w-4" /> Max position</div>
            <p className="mt-2 font-semibold text-foreground">{maxPositionSize}%</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border/50 bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Daily loss utilization</p>
              <p className="mt-1 text-xs text-muted-foreground">{utilization === null ? "Live loss data will appear after a verified broker connection." : `$${dailyLossUsed?.toLocaleString()} used of $${dailyLossLimit.toLocaleString()}`}</p>
            </div>
            <span className="text-sm font-semibold text-foreground">{utilization === null ? "Unavailable" : `${utilization.toFixed(0)}%`}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full transition-all ${utilization !== null && utilization >= 80 ? "bg-red-500" : "bg-accent"}`} style={{ width: `${utilization ?? 0}%` }} />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className={`flex items-start gap-2 text-sm ${brokerConnected ? "text-green-400" : "text-amber-400"}`}>
            {brokerConnected ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{brokerConnected ? "Broker connection verified." : "Connect and validate a broker before enabling live execution."}</span>
          </div>
          <div className={`flex items-start gap-2 text-sm ${hasValidLimit ? "text-green-400" : "text-red-400"}`}>
            {hasValidLimit ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{hasValidLimit ? "Daily loss limit is configured." : "Set a positive daily loss limit before live execution."}</span>
          </div>
          {!brokerConnected && <div className="flex items-start gap-2 text-sm text-muted-foreground"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Loss utilization is intentionally unavailable while the broker is disconnected; no synthetic performance is shown.</span></div>}
        </div>
      </div>
    </Card>
  );
}
