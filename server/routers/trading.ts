import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { assertLiveOrderAllowed, type SupportedBroker } from "../liveOrderGuard";
import { assertRequestAllowed } from "../requestRateLimit";
import { getBrokerAdapter } from "../brokers";
import {
  appendAuditLog,
  cancelPaperOrderForUser,
  createPaperOrderForUser,
  modifyPaperOrderForUser,
  fundPaperAccountForUser,
  getPaperAccountForUser,
  listPaperOrdersForUser,
  listPaperPositionsForUser,
  listTradeHistoryForUser,
} from "../db";

const orderInput = z.object({
  symbol: z.string().min(3).max(32),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.number().finite().positive(),
});

const paperError = (error: unknown) => new TRPCError({ code: "PRECONDITION_FAILED", message: error instanceof Error ? error.message : "Paper order could not be accepted." });

export const tradingRouter = router({
  getPaperAccount: protectedProcedure.query(async ({ ctx }) => {
    const account = await getPaperAccountForUser(ctx.user.id);
    return { cashBalance: Number(account?.cashBalance ?? 0), configured: Boolean(account) };
  }),

  fundPaperAccount: protectedProcedure.input(z.object({ amount: z.number().finite().positive().max(1_000_000) })).mutation(async ({ ctx, input }) => {
    const account = await fundPaperAccountForUser(ctx.user.id, input.amount);
    if (!account) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Paper ledger is unavailable because the database is not connected." });
    return { cashBalance: Number(account.cashBalance) };
  }),

  placeMarketOrder: protectedProcedure.input(orderInput.extend({ price: z.number().finite().positive() })).mutation(async ({ ctx, input }) => {
    try {
      const order = await createPaperOrderForUser(ctx.user.id, { ...input, orderType: "market" });
      if (!order) throw new Error("Paper ledger is unavailable because the database is not connected.");
      return { id: String(order.id), status: order.status, message: "Paper market order filled against the submitted live quote." };
    } catch (error) {
      throw paperError(error);
    }
  }),

  placeLimitOrder: protectedProcedure.input(orderInput.extend({ limitPrice: z.number().finite().positive() })).mutation(async ({ ctx, input }) => {
    try {
      const order = await createPaperOrderForUser(ctx.user.id, { ...input, orderType: "limit" });
      if (!order) throw new Error("Paper ledger is unavailable because the database is not connected.");
      return { id: String(order.id), status: order.status, message: "Paper limit order is open. It is not matched until a paper execution provider is connected." };
    } catch (error) {
      throw paperError(error);
    }
  }),

  getTradeHistory: protectedProcedure.query(async ({ ctx }) => (await listTradeHistoryForUser(ctx.user.id)).map((trade) => ({ id: String(trade.id), orderId: String(trade.orderId), symbol: trade.symbol, side: trade.side, orderType: "paper", status: "FILLED", price: Number(trade.price), quantity: Number(trade.quantity), totalValue: Number(trade.price) * Number(trade.quantity), realizedPnl: Number(trade.realizedPnl), createdAt: trade.createdAt, timestamp: trade.createdAt.getTime() }))),

  placeLiveMarketOrder: protectedProcedure.input(z.object({ broker: z.enum(["binance", "coinbase", "kraken"]), symbol: z.string().min(3), side: z.enum(["BUY", "SELL"]), quantity: z.number().positive(), price: z.number().positive(), dailyLossLimit: z.number().positive(), dailyLossUsed: z.number().nonnegative(), explicitConfirmation: z.literal(true) })).mutation(async ({ ctx, input }) => {
    assertRequestAllowed(ctx.user.id, "live-order", 5, 60_000);
    try {
      assertLiveOrderAllowed({ broker: input.broker as SupportedBroker, dailyLossLimit: input.dailyLossLimit, dailyLossUsed: input.dailyLossUsed, explicitConfirmation: input.explicitConfirmation });
    } catch (error) {
      await appendAuditLog({ eventType: "live_order_gate", outcome: "rejected", broker: input.broker, symbol: input.symbol, message: error instanceof Error ? error.message : "Live order rejected by safety gate", metadata: JSON.stringify({ side: input.side }) }, ctx.user.id);
      throw error;
    }
    const adapter = getBrokerAdapter(input.broker);
    if (!adapter.enabled) {
      const message = "Live execution adapter is not enabled for this environment. Configure and validate a broker connection before enabling real orders.";
      await appendAuditLog({ eventType: "live_order_adapter", outcome: "unavailable", broker: input.broker, symbol: input.symbol, message, metadata: JSON.stringify({ side: input.side }) }, ctx.user.id);
      throw new TRPCError({ code: "PRECONDITION_FAILED", message });
    }
    return adapter.submitMarketOrder({ symbol: input.symbol, side: input.side, quantity: input.quantity, price: input.price });
  }),

  modifyOrder: protectedProcedure.input(z.object({ orderId: z.coerce.number().int().positive(), quantity: z.number().finite().positive(), limitPrice: z.number().finite().positive() })).mutation(async ({ ctx, input }) => {
    const modified = await modifyPaperOrderForUser(ctx.user.id, input.orderId, input.quantity, input.limitPrice);
    if (!modified) throw new TRPCError({ code: "NOT_FOUND", message: "Only an open paper limit order owned by this user can be modified." });
    return { id: String(input.orderId), status: "open" as const };
  }),

  cancelOrder: protectedProcedure.input(z.object({ orderId: z.coerce.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const cancelled = await cancelPaperOrderForUser(ctx.user.id, input.orderId);
    if (!cancelled) throw new TRPCError({ code: "NOT_FOUND", message: "Only an open paper order owned by this user can be cancelled." });
    return { id: String(input.orderId), status: "cancelled" as const };
  }),

  getTrades: protectedProcedure.query(async ({ ctx }) => ({ trades: (await listTradeHistoryForUser(ctx.user.id)).map((trade) => ({ id: String(trade.id), symbol: trade.symbol, side: trade.side, quantity: Number(trade.quantity), price: Number(trade.price), totalValue: Number(trade.quantity) * Number(trade.price), status: "FILLED", timestamp: trade.createdAt, pnl: Number(trade.realizedPnl), pnlPercent: 0 })) })),

  getPositions: protectedProcedure.query(async ({ ctx }) => ({ positions: (await listPaperPositionsForUser(ctx.user.id)).filter((position) => Number(position.quantity) > 0).map((position) => ({ symbol: position.symbol, quantity: Number(position.quantity), entryPrice: Number(position.averageEntryPrice), currentPrice: null, unrealizedPnl: null, unrealizedPnlPercent: null, side: "LONG" as const })) })),

  getPendingOrders: protectedProcedure.query(async ({ ctx }) => ({ orders: (await listPaperOrdersForUser(ctx.user.id)).filter((order) => order.status === "open").map((order) => ({ id: String(order.id), symbol: order.symbol, side: order.side, quantity: Number(order.quantity), limitPrice: Number(order.limitPrice), status: order.status, createdAt: order.createdAt })) })),
});
