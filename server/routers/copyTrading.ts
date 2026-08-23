import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { createCopyTradeForUser, getActiveTraderById, listActiveTraders, listCopyTradesForUser, updateCopyTradeStatusForUser } from "../db";

export type TraderRecord = {
  id: string;
  name: string;
  strategy: string;
  winRate: number;
  monthlyReturn: number;
  followers: number;
  reputation: number;
  totalTrades: number;
  isFollowing: boolean;
};

export type CopyRecord = {
  id: string;
  traderId: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  pnl: number;
  status: string;
};

const unavailable = (message: string): never => {
  throw new TRPCError({ code: "PRECONDITION_FAILED", message });
};

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) unavailable("The selected trader identity is invalid.");
  return id;
};

const toTraderRecord = (trader: Awaited<ReturnType<typeof listActiveTraders>>[number]): TraderRecord => ({
  id: String(trader.id),
  name: trader.name,
  strategy: trader.strategy,
  winRate: trader.winRateBps / 100,
  monthlyReturn: trader.monthlyReturnBps / 100,
  followers: trader.followers,
  reputation: trader.reputationBps / 100,
  totalTrades: trader.totalTrades,
  isFollowing: false,
});

export const copyTradingRouter = router({
  getTopTraders: protectedProcedure.query(async ({ ctx }) => {
    const [traders, copyIntents] = await Promise.all([listActiveTraders(), listCopyTradesForUser(ctx.user.id)]);
    const followingIds = new Set(copyIntents.filter(({ copyTrade }) => copyTrade.status !== "stopped").map(({ copyTrade }) => copyTrade.traderId));
    return {
      traders: traders.map((trader) => ({ ...toTraderRecord(trader), isFollowing: followingIds.has(trader.id) })),
      status: traders.length ? "live" as const : "awaiting-provider" as const,
      message: traders.length ? undefined : "No live trader registry is connected. Trader profiles are not fabricated in this workspace.",
    };
  }),

  followTrader: protectedProcedure.input(z.object({ traderId: z.string().min(1), allocationBps: z.number().int().min(1).max(2500).default(500), maxLossBps: z.number().int().min(1).max(10000).default(1000) })).mutation(async ({ ctx, input }) => {
    const trader = await getActiveTraderById(parseId(input.traderId));
    if (!trader) return unavailable("Following is unavailable until the selected live trader exists in the persistent registry.");
    const id = await createCopyTradeForUser({ traderId: trader.id, status: "staged", allocationBps: input.allocationBps, maxLossBps: input.maxLossBps }, ctx.user.id);
    if (!id) return unavailable("Following is unavailable because the persistence layer is not connected.");
    return { id: String(id), status: "staged" as const, message: "Trader-following intent staged. No broker order was submitted." };
  }),

  unfollowTrader: protectedProcedure.input(z.object({ traderId: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const traderId = parseId(input.traderId);
    const rows = await listCopyTradesForUser(ctx.user.id);
    const intent = rows.find(({ copyTrade }) => copyTrade.traderId === traderId && copyTrade.status !== "stopped");
    if (!intent) return unavailable("No active staged copy intent was found for this trader.");
    const updated = await updateCopyTradeStatusForUser(ctx.user.id, intent.copyTrade.id, "stopped");
    if (!updated) return unavailable("The copy-trading intent could not be updated.");
    return { status: "stopped" as const };
  }),

  copyTrade: protectedProcedure.input(z.object({ traderId: z.string().min(1), tradeId: z.string().min(1), quantity: z.number().positive() })).mutation(async () => unavailable("Copy execution is blocked until a verified trader feed, broker, risk policy, and explicit order confirmation are connected.")),

  getActiveCopies: protectedProcedure.query(async ({ ctx }) => {
    const rows = await listCopyTradesForUser(ctx.user.id);
    const active = rows.filter(({ copyTrade }) => copyTrade.status === "active");
    return {
      copies: active.map(({ copyTrade, trader }) => ({ id: String(copyTrade.id), traderId: String(trader.id), symbol: "", side: "BUY" as const, quantity: 0, pnl: 0, status: copyTrade.status })),
      status: active.length ? "live" as const : "awaiting-provider" as const,
      message: active.length ? undefined : "No broker-linked copied positions are available.",
    };
  }),

  getCopyHistory: protectedProcedure.query(async ({ ctx }) => {
    const rows = await listCopyTradesForUser(ctx.user.id);
    return {
      history: rows.map(({ copyTrade, trader }) => ({ id: String(copyTrade.id), traderId: String(trader.id), trader: toTraderRecord(trader), status: copyTrade.status, createdAt: copyTrade.createdAt, updatedAt: copyTrade.updatedAt })),
      status: rows.length ? "live" as const : "awaiting-provider" as const,
      message: rows.length ? undefined : "No persisted copy-trade history is available.",
    };
  }),
});
