import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  const now = new Date();
  return {
    user: { id: 1, openId: "copy-test-user", email: "copy@example.com", name: "Copy Test", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("copy trading provider boundaries", () => {
  it("does not return fabricated trader profiles or positions", async () => {
    const caller = appRouter.createCaller(createContext());
    const traders = await caller.copyTrading.getTopTraders();
    const copies = await caller.copyTrading.getActiveCopies();
    const bots = await caller.bots.list();
    const signals = await caller.signals.list();
    expect(traders.traders).toEqual([]);
    expect(traders.status).toBe("awaiting-provider");
    expect(copies.copies).toEqual([]);
    expect(bots.bots).toEqual([]);
    expect(bots.status).toBe("empty");
    expect(signals.signals).toEqual([]);
    expect(signals.status).toBe("awaiting-provider");
  });

  it("rejects malformed bot and copy inputs at the tRPC boundary", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.bots.create({ name: "x", strategy: "", symbol: "bad", allocation: 0, stopLoss: 0, takeProfit: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.copyTrading.followTrader({ traderId: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.copyTrading.copyTrade({ traderId: "", tradeId: "", quantity: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects follow and copy mutations when providers are not connected", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.copyTrading.followTrader({ traderId: "trader-1" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(caller.copyTrading.copyTrade({ traderId: "trader-1", tradeId: "trade-1", quantity: 1 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
