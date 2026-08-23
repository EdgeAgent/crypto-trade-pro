import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { createTradingBotForUser, listTradingBotsForUser, updateTradingBotStatusForUser } from "../db";
import { transitionBotStatus, type BotAction, type BotStatus } from "../../shared/botLifecycle";

const botInput = z.object({
  name: z.string().trim().min(3).max(160),
  strategy: z.string().min(1).max(80),
  symbol: z.string().regex(/^[A-Z0-9]{6,12}$/),
  allocation: z.number().positive().max(25),
  stopLoss: z.number().positive().max(50),
  takeProfit: z.number().positive().max(100),
}).refine((value) => value.takeProfit > value.stopLoss, { message: "Take profit must exceed stop loss.", path: ["takeProfit"] });

const actionSchema = z.enum(["activate", "pause", "resume", "stop", "restart"]);

export const botsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const bots = await listTradingBotsForUser(ctx.user.id);
    return {
      bots: bots.map((bot) => ({ id: String(bot.id), name: bot.name, strategy: bot.strategy, symbol: bot.symbol, allocation: bot.allocationBps / 100, stopLoss: bot.stopLossBps / 100, takeProfit: bot.takeProfitBps / 100, status: bot.status, createdAt: bot.createdAt })),
      status: bots.length ? "live" as const : "empty" as const,
      message: bots.length ? undefined : "No persisted strategy bots are available.",
    };
  }),

  create: protectedProcedure.input(botInput).mutation(async ({ ctx, input }) => {
    const id = await createTradingBotForUser({ name: input.name, strategy: input.strategy, symbol: input.symbol, allocationBps: Math.round(input.allocation * 100), stopLossBps: Math.round(input.stopLoss * 100), takeProfitBps: Math.round(input.takeProfit * 100), status: "staged" }, ctx.user.id);
    if (!id) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Bot staging is unavailable because the persistence layer is not connected." });
    return { id: String(id), status: "staged" as const, message: `${input.name} staged. No broker order was submitted.` };
  }),

  transition: protectedProcedure.input(z.object({ id: z.string().regex(/^\d+$/), action: actionSchema })).mutation(async ({ ctx, input }) => {
    const id = Number(input.id);
    const bots = await listTradingBotsForUser(ctx.user.id);
    const bot = bots.find((candidate) => candidate.id === id);
    if (!bot) throw new TRPCError({ code: "NOT_FOUND", message: "The requested strategy bot was not found." });
    let next: BotStatus;
    try {
      next = transitionBotStatus(bot.status as BotStatus, input.action as BotAction);
    } catch {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Cannot ${input.action} a ${bot.status} bot.` });
    }
    if (next === bot.status && input.action !== "pause") throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Cannot ${input.action} a ${bot.status} bot.` });
    const updated = await updateTradingBotStatusForUser(ctx.user.id, id, next);
    if (!updated) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The bot state could not be persisted." });
    return { id: input.id, status: next };
  }),
});
