import { publicProcedure, router } from "../_core/trpc";

export type SignalRecord = {
  id: string;
  symbol: string;
  type: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  source: "AI" | "Trader";
};

export const signalsRouter = router({
  list: publicProcedure.query(async () => ({
    signals: [] as SignalRecord[],
    source: "server",
    status: "awaiting-provider",
    message: "No signal provider is connected. Configure an advisory AI provider to populate this feed.",
  })),
});
