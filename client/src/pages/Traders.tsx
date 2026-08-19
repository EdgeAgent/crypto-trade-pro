import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TraderDiscovery, { type TraderProfile } from "@/components/TraderDiscovery";
import CopyTradingDashboard from "@/components/CopyTradingDashboard";

export default function Traders() {
  const [copiedTraders, setCopiedTraders] = useState<TraderProfile[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const handleCopy = (trader: TraderProfile) => {
    setCopiedTraders((current) => current.some((item) => item.id === trader.id) ? current : [...current, trader]);
    setNotice(`${trader.name} added to your copy-trading workspace. Broker execution remains gated until you connect an exchange.`);
    window.setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8"><h1 className="text-2xl font-bold text-foreground">Top Traders</h1><p className="text-sm text-muted-foreground mt-1">Discover, follow, and stage copy-trading plans without submitting real orders.</p></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {notice && <Card className="border-accent/40 bg-accent/5 p-4"><p className="text-sm text-accent">{notice}</p></Card>}
        <TraderDiscovery onCopy={handleCopy} />
        <CopyTradingDashboard copiedTraders={copiedTraders} onStopCopy={(traderId) => setCopiedTraders((current) => current.filter((trader) => trader.id !== traderId))} />
        <Card className="border-border/50 bg-muted/10"><div className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-foreground">Copy trading safety</h2><p className="mt-1 text-sm text-muted-foreground">Copy plans are tracked as intent until a verified broker, risk limit, and per-order confirmation are present.</p></div><Badge variant="outline" className="border-amber-500/40 text-amber-400">Execution gated</Badge></div></div></Card>
      </div>
    </div>
  );
}
