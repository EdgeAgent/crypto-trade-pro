import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";

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

export const copyTradingRouter = router({
  getTopTraders: protectedProcedure.query(async () => ({
    traders: [] as TraderRecord[],
    status: "awaiting-provider" as const,
    message: "No live trader registry is connected. Trader profiles are not fabricated in this workspace.",
  })),

  followTrader: protectedProcedure.input(z.object({ traderId: z.string().min(1) })).mutation(async () => unavailable("Following is unavailable until a persistent trader registry is connected.")),

  unfollowTrader: protectedProcedure.input(z.object({ traderId: z.string().min(1) })).mutation(async () => unavailable("Unfollowing is unavailable until a persistent trader registry is connected.")),

  copyTrade: protectedProcedure.input(z.object({ traderId: z.string().min(1), tradeId: z.string().min(1), quantity: z.number().positive() })).mutation(async () => unavailable("Copy execution is blocked until a verified trader feed, broker, risk policy, and explicit order confirmation are connected.")),

  getActiveCopies: protectedProcedure.query(async () => ({
    copies: [] as CopyRecord[],
    status: "awaiting-provider" as const,
    message: "No broker-linked copied positions are available.",
  })),

  getCopyHistory: protectedProcedure.query(async () => ({
    history: [],
    status: "awaiting-provider" as const,
    message: "No persisted copy-trade history is available.",
  })),
});
