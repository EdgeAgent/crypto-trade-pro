import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  copyTrades,
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

export async function listTradeHistoryForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // The legacy trades table remains the source for executed trade history.
  const [rows] = await db.execute(sql`SELECT * FROM trades WHERE userId = ${userId} ORDER BY timestamp DESC`);
  return Array.isArray(rows) ? rows : [];
}
