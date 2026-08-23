import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BriefcaseBusiness, LockKeyhole } from "lucide-react";
import { Link } from "wouter";

export default function PortfolioHoldings() {
  return (
    <div className="space-y-5">
      <Card className="surface-glow overflow-hidden border-white/10 bg-card/80">
        <div className="relative p-5 sm:p-6">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-accent/20 bg-accent/10 p-3 text-accent"><BriefcaseBusiness className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Portfolio</p>
                <h2 className="mt-1 text-xl font-bold text-foreground">Positions will appear here</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">No holdings are seeded. Connect a broker or execute a verified order to stream real positions and mark-to-market P&amp;L.</p>
              </div>
            </div>
            <Link href="/settings" className="touch-target inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 text-sm font-semibold text-accent transition-colors hover:bg-accent/15">Open settings <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </Card>
      <Card className="border-white/10 bg-card/60">
        <div className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">No synthetic account values</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">CryptoTrade Pro keeps the dashboard honest while account data is unavailable.</p>
            </div>
          </div>
          <Button asChild variant="ghost" className="min-h-11 w-full justify-center text-muted-foreground hover:text-foreground sm:w-auto"><Link href="/trading">View markets <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </Card>
    </div>
  );
}
