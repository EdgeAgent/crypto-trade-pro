import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTradingContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "live-order-test-user",
    email: "live-order@example.com",
    name: "Live Order Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validOrder = {
  broker: "binance" as const,
  symbol: "BTC/USDT",
  side: "BUY" as const,
  quantity: 0.001,
  price: 62715,
  dailyLossLimit: 1000,
  dailyLossUsed: 0,
  explicitConfirmation: true as const,
};

describe("trading paper-ledger safety", () => {
  it("requires explicit paper funding before a market buy can fill", async () => {
    const caller = appRouter.createCaller(createTradingContext());
    await expect(caller.trading.placeMarketOrder({ symbol: "BTC/USDT", side: "BUY", quantity: 0.001, price: 62000 })).rejects.toThrow("Insufficient paper cash");
  });

  it("requires funds for a limit buy and rejects cancellation or modification of unknown orders", async () => {
    const caller = appRouter.createCaller(createTradingContext());
    await expect(caller.trading.placeLimitOrder({ symbol: "BTC/USDT", side: "BUY", quantity: 0.001, limitPrice: 61000 })).rejects.toThrow("Insufficient paper cash");
    await expect(caller.trading.cancelOrder({ orderId: 1 })).rejects.toThrow("Only an open paper order");
    await expect(caller.trading.modifyOrder({ orderId: 1, quantity: 0.002, limitPrice: 60000 })).rejects.toThrow("Only an open paper limit order");
  });

  it("returns a stable detailed trade-history collection", async () => {
    const caller = appRouter.createCaller(createTradingContext());
    const history = await caller.trading.getTradeHistory();
    expect(Array.isArray(history)).toBe(true);
    for (const fill of history) {
      expect(fill).toEqual(expect.objectContaining({ id: expect.any(String), orderId: expect.any(String), symbol: expect.any(String), status: "FILLED", price: expect.any(Number), quantity: expect.any(Number), realizedPnl: expect.any(Number) }));
    }
  });
});

describe("trading.placeLiveMarketOrder", () => {
  it("rejects placeholder-only broker credentials at the procedure boundary", async () => {
    delete process.env.BINANCE_API_KEY;
    delete process.env.BINANCE_API_SECRET;

    const caller = appRouter.createCaller(createTradingContext());

    await expect(caller.trading.placeLiveMarketOrder(validOrder)).rejects.toThrow("No verified binance credentials");
  });

  it("rejects a reached daily loss limit before an adapter can execute", async () => {
    process.env.BINANCE_API_KEY = "configured-for-test";
    process.env.BINANCE_API_SECRET = "configured-for-test";

    const caller = appRouter.createCaller(createTradingContext());

    await expect(
      caller.trading.placeLiveMarketOrder({ ...validOrder, dailyLossUsed: 1000 })
    ).rejects.toThrow("daily loss limit has been reached");
  });

  it("rejects missing per-order confirmation through input validation", async () => {
    const caller = appRouter.createCaller(createTradingContext());

    await expect(
      caller.trading.placeLiveMarketOrder({ ...validOrder, explicitConfirmation: false } as never)
    ).rejects.toThrow();
  });
});
