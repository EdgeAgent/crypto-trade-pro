import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextWithUser(user: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("protected API flow boundaries", () => {
  it("rejects unauthenticated access across protected product areas", async () => {
    const caller = appRouter.createCaller(contextWithUser(null));
    await expect(caller.trading.getPaperAccount()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.signals.generate({ symbol: "BTCUSDT", price: 60_000, change24h: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.bots.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.copyTrading.getTopTraders()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps the public signal feed callable without granting execution access", async () => {
    const caller = appRouter.createCaller(contextWithUser(null));
    const result = await caller.signals.list({ symbol: "BTCUSDT" });
    expect(result).toHaveProperty("signals");
    expect(result).not.toHaveProperty("placeLiveMarketOrder");
  });
});
