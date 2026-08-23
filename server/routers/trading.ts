import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { assertLiveOrderAllowed, type SupportedBroker } from "../liveOrderGuard";
import { appendAuditLog } from "../db";

const paperLedgerUnavailable = () => new TRPCError({ code: "PRECONDITION_FAILED", message: "Paper execution is unavailable until the persisted paper ledger is configured. No order was submitted." });

export const tradingRouter = router({
  placeMarketOrder: protectedProcedure.input(z.object({ symbol: z.string().min(3).max(32), side: z.enum(["BUY", "SELL"]), quantity: z.number().finite().positive(), price: z.number().finite().positive() })).mutation(() => { throw paperLedgerUnavailable(); }),

  getTradeHistory: protectedProcedure.query(async () => [] as Array<{ id: string; side: "BUY" | "SELL"; price: number; quantity: number; realizedPnl: number; timestamp: number }>),

  placeLimitOrder: protectedProcedure.input(z.object({ symbol: z.string().min(3).max(32), side: z.enum(["BUY", "SELL"]), quantity: z.number().finite().positive(), limitPrice: z.number().finite().positive() })).mutation(() => { throw paperLedgerUnavailable(); }),

  placeLiveMarketOrder: protectedProcedure.input(z.object({ broker: z.enum(["binance", "coinbase", "kraken"]), symbol: z.string().min(3), side: z.enum(["BUY", "SELL"]), quantity: z.number().positive(), price: z.number().positive(), dailyLossLimit: z.number().positive(), dailyLossUsed: z.number().nonnegative(), explicitConfirmation: z.literal(true) })).mutation(async ({ ctx, input }) => {
    try {
      assertLiveOrderAllowed({ broker: input.broker as SupportedBroker, dailyLossLimit: input.dailyLossLimit, dailyLossUsed: input.dailyLossUsed, explicitConfirmation: input.explicitConfirmation });
    } catch (error) {
      await appendAuditLog({ eventType: "live_order_gate", outcome: "rejected", broker: input.broker, symbol: input.symbol, message: error instanceof Error ? error.message : "Live order rejected by safety gate", metadata: JSON.stringify({ side: input.side }) }, ctx.user.id);
      throw error;
    }
    const message = "Live execution adapter is not enabled for this environment. Configure and validate a broker connection before enabling real orders.";
    await appendAuditLog({ eventType: "live_order_adapter", outcome: "unavailable", broker: input.broker, symbol: input.symbol, message, metadata: JSON.stringify({ side: input.side }) }, ctx.user.id);
    throw new TRPCError({ code: "PRECONDITION_FAILED", message });
  }),

  cancelOrder: protectedProcedure.input(z.object({ orderId: z.string().min(1) })).mutation(() => { throw paperLedgerUnavailable(); }),

  getTrades: protectedProcedure.query(async () => ({ trades: [] as Array<{ id: string; symbol: string; side: "BUY" | "SELL"; quantity: number; price: number; totalValue: number; status: string; timestamp: Date; pnl: number; pnlPercent: number }> })),

  getPositions: protectedProcedure.query(async () => ({ positions: [] as Array<{ symbol: string; quantity: number; entryPrice: number; currentPrice: number; unrealizedPnl: number; unrealizedPnlPercent: number; side: "LONG" | "SHORT" }> })),

  getPendingOrders: protectedProcedure.query(async () => ({ orders: [] as Array<{ id: string; symbol: string; side: "BUY" | "SELL"; quantity: number; limitPrice: number; status: string; createdAt: Date }> })),
});
