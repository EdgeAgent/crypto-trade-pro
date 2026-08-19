import React from "react";
import { Card } from "@/components/ui/card";
import CandlestickChart from "@/components/CandlestickChart";
import type { LiveTickerState } from "@/lib/liveTicker";

interface LiveQuotePanelProps {
  symbol: string;
  ticker: LiveTickerState;
}

export default function LiveQuotePanel({ symbol, ticker }: LiveQuotePanelProps) {
  if (!ticker.data) return <Card className="border-border/50 bg-card p-10 flex min-h-[420px] items-center justify-center text-center"><div><p className="font-semibold text-foreground">Waiting for live quote</p><p className="mt-2 text-sm text-muted-foreground">{ticker.status === "offline" ? "Selected-pair ticker is unavailable; reconnecting with bounded backoff." : "Connecting to the selected-pair ticker…"}</p></div></Card>;
  return <CandlestickChart symbol={symbol.split("/")[0]} price={ticker.data.price} change24h={ticker.data.change24h} />;
}
