import { int, index, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A provider-backed trader profile. A profile is only visible once a provider
 * has written it; this project never seeds demo traders.
 */
export const traders = mysqlTable("traders", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 64 }).notNull(),
  providerTraderId: varchar("providerTraderId", { length: 128 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  strategy: varchar("strategy", { length: 160 }).notNull(),
  winRateBps: int("winRateBps").notNull().default(0),
  monthlyReturnBps: int("monthlyReturnBps").notNull().default(0),
  followers: int("followers").notNull().default(0),
  totalTrades: int("totalTrades").notNull().default(0),
  reputationBps: int("reputationBps").notNull().default(0),
  status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  providerTraderIdx: index("traders_provider_trader_idx").on(table.provider, table.providerTraderId),
  statusIdx: index("traders_status_idx").on(table.status),
}));

export type Trader = typeof traders.$inferSelect;
export type InsertTrader = typeof traders.$inferInsert;

/**
 * A user's copy-trading intent. It is not an executed position until a
 * verified broker and execution provider record that result.
 */
export const copyTrades = mysqlTable("copy_trades", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  traderId: int("traderId").notNull().references(() => traders.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["staged", "active", "paused", "stopped"]).notNull().default("staged"),
  allocationBps: int("allocationBps").notNull(),
  maxLossBps: int("maxLossBps").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userStatusIdx: index("copy_trades_user_status_idx").on(table.userId, table.status),
  traderIdx: index("copy_trades_trader_idx").on(table.traderId),
}));

export type CopyTrade = typeof copyTrades.$inferSelect;
export type InsertCopyTrade = typeof copyTrades.$inferInsert;

/**
 * A staged or policy-approved strategy bot. Parameters are stored as basis
 * points to avoid floating-point policy drift at the persistence boundary.
 */
export const tradingBots = mysqlTable("trading_bots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  strategy: varchar("strategy", { length: 80 }).notNull(),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  allocationBps: int("allocationBps").notNull(),
  stopLossBps: int("stopLossBps").notNull(),
  takeProfitBps: int("takeProfitBps").notNull(),
  status: mysqlEnum("status", ["staged", "active", "paused", "stopped"]).notNull().default("staged"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userStatusIdx: index("trading_bots_user_status_idx").on(table.userId, table.status),
}));

export type TradingBot = typeof tradingBots.$inferSelect;
export type InsertTradingBot = typeof tradingBots.$inferInsert;

/** Provider-backed advisory output. Signals are informational by design. */
export const tradingSignals = mysqlTable("trading_signals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  provider: varchar("provider", { length: 64 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  direction: mysqlEnum("direction", ["BUY", "SELL", "HOLD"]).notNull(),
  confidenceBps: int("confidenceBps").notNull(),
  reasoning: text("reasoning").notNull(),
  status: mysqlEnum("status", ["active", "expired"]).notNull().default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
}, (table) => ({
  symbolStatusIdx: index("trading_signals_symbol_status_idx").on(table.symbol, table.status),
  createdAtIdx: index("trading_signals_created_at_idx").on(table.createdAt),
}));

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = typeof tradingSignals.$inferInsert;
