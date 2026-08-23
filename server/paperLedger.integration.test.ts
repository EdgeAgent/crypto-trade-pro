import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPaperAccountForUser: vi.fn(),
  fundPaperAccountForUser: vi.fn(),
  createPaperOrderForUser: vi.fn(),
  modifyPaperOrderForUser: vi.fn(),
  cancelPaperOrderForUser: vi.fn(),
  listPaperOrdersForUser: vi.fn(),
  listPaperPositionsForUser: vi.fn(),
  listTradeHistoryForUser: vi.fn(),
}));

vi.mock("./db", async importOriginal => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  const now = new Date("2026-08-23T00:00:00.000Z");
  return { user: { id: 42, openId: "ledger-user", email: "ledger@example.com", name: "Ledger User", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("authenticated paper ledger API flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPaperAccountForUser.mockResolvedValue({ cashBalance: "1000.00" });
    mocks.fundPaperAccountForUser.mockResolvedValue({ cashBalance: "1500.00" });
    mocks.createPaperOrderForUser.mockImplementation(async (_userId, input) => ({ id: input.orderType === "market" ? 11 : 12, status: input.orderType === "market" ? "filled" : "open" }));
    mocks.modifyPaperOrderForUser.mockResolvedValue(true);
    mocks.cancelPaperOrderForUser.mockResolvedValue(true);
    mocks.listPaperOrdersForUser.mockResolvedValue([{ id: 12, symbol: "BTCUSDT", side: "BUY", quantity: "0.01", limitPrice: "60000", status: "open", createdAt: new Date("2026-08-23T00:00:00.000Z") }]);
    mocks.listPaperPositionsForUser.mockResolvedValue([{ symbol: "BTCUSDT", quantity: "0.01", averageEntryPrice: "60000", realizedPnl: "0" }]);
    mocks.listTradeHistoryForUser.mockResolvedValue([{ id: 21, orderId: 11, symbol: "BTCUSDT", side: "BUY", price: "60000", quantity: "0.01", realizedPnl: "0", createdAt: new Date("2026-08-23T00:00:00.000Z") }]);
  });

  it("round-trips funding, market/limit order lifecycle, positions, and fills", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.trading.getPaperAccount()).resolves.toMatchObject({ cashBalance: 1000, configured: true });
    await expect(caller.trading.fundPaperAccount({ amount: 500 })).resolves.toEqual({ cashBalance: 1500 });
    await expect(caller.trading.placeMarketOrder({ symbol: "BTCUSDT", side: "BUY", quantity: 0.01, price: 60000 })).resolves.toMatchObject({ id: "11", status: "filled" });
    await expect(caller.trading.placeLimitOrder({ symbol: "BTCUSDT", side: "BUY", quantity: 0.01, limitPrice: 59000 })).resolves.toMatchObject({ id: "12", status: "open" });
    await expect(caller.trading.modifyOrder({ orderId: "12", quantity: 0.02, limitPrice: 59500 })).resolves.toEqual({ id: "12", status: "open" });
    await expect(caller.trading.cancelOrder({ orderId: "12" })).resolves.toEqual({ id: "12", status: "cancelled" });
    await expect(caller.trading.getPositions()).resolves.toMatchObject({ positions: [{ symbol: "BTCUSDT", quantity: 0.01, entryPrice: 60000 }] });
    await expect(caller.trading.getTradeHistory()).resolves.toMatchObject([{ id: "21", orderId: "11", totalValue: 600, realizedPnl: 0 }]);
    expect(mocks.createPaperOrderForUser).toHaveBeenCalledTimes(2);
    expect(mocks.modifyPaperOrderForUser).toHaveBeenCalledWith(42, 12, 0.02, 59500);
    expect(mocks.cancelPaperOrderForUser).toHaveBeenCalledWith(42, 12);
  });
});
