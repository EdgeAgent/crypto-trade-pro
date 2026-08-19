import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import SignalFeed from "@/components/SignalFeed";

export default function Signals() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"><div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8"><h1 className="text-2xl font-bold text-foreground">Trading Signals</h1><p className="text-sm text-muted-foreground mt-1">Provider-backed advisory signals with explicit execution boundaries.</p></div></div>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Card className="border-blue-500/30 bg-blue-500/5"><div className="p-5 flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-blue-400 shrink-0" /><p className="text-sm leading-6 text-blue-200/80">AI output is informational and may be wrong. It does not guarantee returns and does not place orders. Any future execution requires a verified broker, risk gates, and a separate per-order confirmation.</p></div></Card>
        <SignalFeed />
      </div>
    </div>
  );
}
