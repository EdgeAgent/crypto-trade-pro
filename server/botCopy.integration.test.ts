import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTradingBotForUser: vi.fn(),
  listTradingBotsForUser: vi.fn(),
  updateTradingBotStatusForUser: vi.fn(),
  getActiveTraderById: vi.fn(),
  createCopyTradeForUser: vi.fn(),
  listCopyTradesForUser: vi.fn(),
  updateCopyTradeStatusForUser: vi.fn(),
}));

vi.mock("./db", async importOriginal => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  const now = new Date("2026-08-23T00:00:00.000Z");
  return { user: { id: 9, openId: "lifecycle-user", email: "lifecycle@example.com", name: "Lifecycle User", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

const trader = { id: 3, provider: "registry", providerTraderId: "p-3", name: "Provider Trader", strategy: "momentum", winRateBps: 6500, monthlyReturnBps: 1200, followers: 10, reputationBps: 9000, totalTrades: 42, status: "active", ownerUserId: null, createdAt: new Date(), updatedAt: new Date() };

describe("authenticated bot and copy lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTradingBotForUser.mockResolvedValue(7);
    mocks.listTradingBotsForUser.mockResolvedValue([{ id: 7, name: "Momentum", strategy: "momentum", symbol: "BTCUSDT", allocationBps: 500, stopLossBps: 200, takeProfitBps: 600, status: "staged", createdAt: new Date() }]);
    mocks.updateTradingBotStatusForUser.mockResolvedValue(true);
    mocks.getActiveTraderById.mockResolvedValue(trader);
    mocks.createCopyTradeForUser.mockResolvedValue(8);
    mocks.listCopyTradesForUser.mockResolvedValue([{ copyTrade: { id: 8, traderId: 3, status: "staged", allocationBps: 500, maxLossBps: 1000, createdAt: new Date(), updatedAt: new Date() }, trader }]);
    mocks.updateCopyTradeStatusForUser.mockResolvedValue(true);
  });

  it("stages a bot and transitions its persisted lifecycle", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.bots.create({ name: "Momentum", strategy: "momentum", symbol: "BTCUSDT", allocation: 5, stopLoss: 2, takeProfit: 6 })).resolves.toMatchObject({ id: "7", status: "staged" });
    await expect(caller.bots.transition({ id: "7", action: "activate" })).resolves.toEqual({ id: "7", status: "active" });
    expect(mocks.updateTradingBotStatusForUser).toHaveBeenCalledWith(9, 7, "active");
  });

  it("stages and stops a provider-backed copy intent without claiming execution", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.copyTrading.followTrader({ traderId: "3" })).resolves.toMatchObject({ id: "8", status: "staged" });
    await expect(caller.copyTrading.unfollowTrader({ traderId: "3" })).resolves.toEqual({ status: "stopped" });
    await expect(caller.copyTrading.getCopyHistory()).resolves.toMatchObject({ history: [{ id: "8", traderId: "3", status: "staged" }] });
    expect(mocks.updateCopyTradeStatusForUser).toHaveBeenCalledWith(9, 8, "stopped");
  });
});
