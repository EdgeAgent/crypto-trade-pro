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
  it("does not claim a market order was executed without a paper ledger", async () => {
    const caller = appRouter.createCaller(createTradingContext());
    await expect(caller.trading.placeMarketOrder({ symbol: "BTC/USDT", side: "BUY", quantity: 0.001, price: 62000 })).rejects.toThrow("Paper execution is unavailable");
  });

  it("does not claim a limit order or cancellation succeeded without a paper ledger", async () => {
    const caller = appRouter.createCaller(createTradingContext());
    await expect(caller.trading.placeLimitOrder({ symbol: "BTC/USDT", side: "BUY", quantity: 0.001, limitPrice: 61000 })).rejects.toThrow("Paper execution is unavailable");
    await expect(caller.trading.cancelOrder({ orderId: "order-1" })).rejects.toThrow("Paper execution is unavailable");
    await expect(caller.trading.getTrades()).resolves.toEqual({ trades: [] });
    await expect(caller.trading.getPositions()).resolves.toEqual({ positions: [] });
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
