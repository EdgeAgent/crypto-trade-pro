import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  copyTrades,
  paperAccounts,
  paperFills,
  paperOrders,
  paperPositions,
  InsertAuditLog,
  InsertCopyTrade,
  InsertTradingBot,
  InsertTradingSignal,
  InsertUser,
  traders,
  tradingBots,
  tradingSignals,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { publishSignalEvent } from "./signalEvents";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] === undefined) continue;
    const normalized = user[field] ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listActiveTraders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(traders).where(eq(traders.status, "active")).orderBy(desc(traders.monthlyReturnBps));
}

export async function getActiveTraderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(traders).where(and(eq(traders.id, id), eq(traders.status, "active"))).limit(1);
  return result[0];
}

export async function listCopyTradesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ copyTrade: copyTrades, trader: traders }).from(copyTrades).innerJoin(traders, eq(copyTrades.traderId, traders.id)).where(eq(copyTrades.userId, userId)).orderBy(desc(copyTrades.updatedAt));
}

export async function createCopyTradeForUser(input: Omit<InsertCopyTrade, "userId">, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(copyTrades).values({ ...input, userId });
  return result[0]?.insertId;
}

export async function updateCopyTradeStatusForUser(userId: number, id: number, status: "staged" | "active" | "paused" | "stopped") {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(copyTrades).set({ status }).where(and(eq(copyTrades.id, id), eq(copyTrades.userId, userId)));
  return result[0]?.affectedRows === 1;
}

export async function listTradingBotsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tradingBots).where(eq(tradingBots.userId, userId)).orderBy(desc(tradingBots.updatedAt));
}

export async function createTradingBotForUser(input: Omit<InsertTradingBot, "userId">, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(tradingBots).values({ ...input, userId });
  return result[0]?.insertId;
}

export async function updateTradingBotStatusForUser(userId: number, id: number, status: "staged" | "active" | "paused" | "stopped") {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(tradingBots).set({ status }).where(and(eq(tradingBots.id, id), eq(tradingBots.userId, userId)));
  return result[0]?.affectedRows === 1;
}

export async function createTradingSignalForUser(input: Omit<InsertTradingSignal, "userId">, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(tradingSignals).values({ ...input, userId });
  const insertId = result[0]?.insertId;
  if (insertId) publishSignalEvent({ id: String(insertId), symbol: input.symbol, direction: input.direction, confidence: input.confidenceBps / 100, reasoning: input.reasoning, provider: input.provider, model: input.model });
  return insertId;
}

export async function listActiveSignals(symbol?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = symbol ? and(eq(tradingSignals.status, "active"), eq(tradingSignals.symbol, symbol)) : eq(tradingSignals.status, "active");
  return db.select().from(tradingSignals).where(conditions).orderBy(desc(tradingSignals.createdAt));
}

export function redactAuditMetadata(metadata?: string) {
  if (!metadata) return undefined;
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    const safe = Object.fromEntries(Object.entries(parsed).filter(([key]) => !/(key|secret|passphrase|token|credential)/i.test(key)));
    return JSON.stringify(safe);
  } catch {
    return undefined;
  }
}

export async function appendAuditLog(input: Omit<InsertAuditLog, "userId">, userId?: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(auditLogs).values({ ...input, metadata: redactAuditMetadata(input.metadata ?? undefined), userId });
    return true;
  } catch (error) {
    console.warn("[Audit] Failed to persist event:", error);
    return false;
  }
}

export async function listAuditLogsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(50);
}

export async function listTradeHistoryForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paperFills).where(eq(paperFills.userId, userId)).orderBy(desc(paperFills.createdAt));
}

function fixed8(value: number) {
  return value.toFixed(8);
}

export async function getPaperAccountForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paperAccounts).where(eq(paperAccounts.userId, userId)).limit(1);
  return result[0];
}

export async function fundPaperAccountForUser(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.transaction(async (tx) => {
    await tx.insert(paperAccounts).values({ userId, cashBalance: "0" }).onDuplicateKeyUpdate({ set: { userId } });
    await tx.update(paperAccounts).set({ cashBalance: sql`${paperAccounts.cashBalance} + ${fixed8(amount)}` }).where(eq(paperAccounts.userId, userId));
    const rows = await tx.select().from(paperAccounts).where(eq(paperAccounts.userId, userId)).limit(1);
    return rows[0];
  });
}

export type PaperOrderInput = { symbol: string; side: "BUY" | "SELL"; orderType: "market" | "limit"; quantity: number; price?: number; limitPrice?: number };

export async function createPaperOrderForUser(userId: number, input: PaperOrderInput) {
  const db = await getDb();
  if (!db) return undefined;
  return db.transaction(async (tx) => {
    await tx.insert(paperAccounts).values({ userId, cashBalance: "0" }).onDuplicateKeyUpdate({ set: { userId } });
    const [account] = await tx.select().from(paperAccounts).where(eq(paperAccounts.userId, userId)).limit(1);
    const [position] = await tx.select().from(paperPositions).where(and(eq(paperPositions.userId, userId), eq(paperPositions.symbol, input.symbol))).limit(1);
    const currentCash = Number(account?.cashBalance ?? 0);
    const currentQuantity = Number(position?.quantity ?? 0);
    const currentAverage = Number(position?.averageEntryPrice ?? 0);
    const executionPrice = input.orderType === "market" ? input.price : undefined;
    const notional = executionPrice ? input.quantity * executionPrice : (input.limitPrice ?? 0) * input.quantity;
    if (!Number.isFinite(notional) || notional <= 0) throw new Error("A positive execution or limit price is required.");
    if (input.side === "BUY" && currentCash < notional) throw new Error("Insufficient paper cash. Fund the paper account before buying.");
    if (input.side === "SELL" && currentQuantity < input.quantity) throw new Error("Insufficient paper position for this sell order.");
    const status = executionPrice ? "filled" : "open";
    const [inserted] = await tx.insert(paperOrders).values({ userId, symbol: input.symbol, side: input.side, orderType: input.orderType, quantity: fixed8(input.quantity), limitPrice: input.limitPrice ? fixed8(input.limitPrice) : null, executedQuantity: executionPrice ? fixed8(input.quantity) : "0", averageFillPrice: executionPrice ? fixed8(executionPrice) : null, status }).$returningId();
    const orderId = Number(inserted.id);
    if (!executionPrice) {
      const [created] = await tx.select().from(paperOrders).where(eq(paperOrders.id, orderId)).limit(1);
      return created;
    }
    const realizedPnl = input.side === "SELL" ? (executionPrice - currentAverage) * input.quantity : 0;
    await tx.insert(paperFills).values({ orderId, userId, symbol: input.symbol, side: input.side, quantity: fixed8(input.quantity), price: fixed8(executionPrice), realizedPnl: fixed8(realizedPnl) });
    if (input.side === "BUY") {
      const newQuantity = currentQuantity + input.quantity;
      const newAverage = newQuantity > 0 ? ((currentQuantity * currentAverage) + notional) / newQuantity : executionPrice;
      await tx.insert(paperPositions).values({ userId, symbol: input.symbol, quantity: fixed8(newQuantity), averageEntryPrice: fixed8(newAverage), realizedPnl: "0" }).onDuplicateKeyUpdate({ set: { quantity: fixed8(newQuantity), averageEntryPrice: fixed8(newAverage) } });
      await tx.update(paperAccounts).set({ cashBalance: sql`${paperAccounts.cashBalance} - ${fixed8(notional)}` }).where(eq(paperAccounts.userId, userId));
    } else {
      const newQuantity = currentQuantity - input.quantity;
      await tx.update(paperPositions).set({ quantity: fixed8(newQuantity), averageEntryPrice: newQuantity > 0 ? fixed8(currentAverage) : "0", realizedPnl: sql`${paperPositions.realizedPnl} + ${fixed8(realizedPnl)}` }).where(and(eq(paperPositions.userId, userId), eq(paperPositions.symbol, input.symbol)));
      await tx.update(paperAccounts).set({ cashBalance: sql`${paperAccounts.cashBalance} + ${fixed8(notional)}` }).where(eq(paperAccounts.userId, userId));
    }
    const [created] = await tx.select().from(paperOrders).where(eq(paperOrders.id, orderId)).limit(1);
    return created;
  });
}

export async function modifyPaperOrderForUser(userId: number, orderId: number, quantity: number, limitPrice: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(paperOrders).set({ quantity: fixed8(quantity), limitPrice: fixed8(limitPrice) }).where(and(eq(paperOrders.id, orderId), eq(paperOrders.userId, userId), eq(paperOrders.orderType, "limit"), eq(paperOrders.status, "open")));
  return result[0]?.affectedRows === 1;
}

export async function cancelPaperOrderForUser(userId: number, orderId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(paperOrders).set({ status: "cancelled" }).where(and(eq(paperOrders.id, orderId), eq(paperOrders.userId, userId), eq(paperOrders.status, "open")));
  return result[0]?.affectedRows === 1;
}

export async function listPaperOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paperOrders).where(eq(paperOrders.userId, userId)).orderBy(desc(paperOrders.createdAt));
}

export async function listPaperPositionsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paperPositions).where(eq(paperPositions.userId, userId)).orderBy(desc(paperPositions.updatedAt));
}
