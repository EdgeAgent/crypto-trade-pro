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
    expect(traders.traders).toEqual([]);
    expect(traders.status).toBe("awaiting-provider");
    expect(copies.copies).toEqual([]);
  });

  it("rejects follow and copy mutations when providers are not connected", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.copyTrading.followTrader({ traderId: "trader-1" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(caller.copyTrading.copyTrade({ traderId: "trader-1", tradeId: "trade-1", quantity: 1 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
