import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ listAuditLogsForUser: vi.fn(), listLLMModels: vi.fn(), invokeLLM: vi.fn() }));

vi.mock("./db", async importOriginal => ({ ...(await importOriginal<typeof import("./db")>()), listAuditLogsForUser: mocks.listAuditLogsForUser }));
vi.mock("./_core/llm", async importOriginal => ({ ...(await importOriginal<typeof import("./_core/llm")>()), listLLMModels: mocks.listLLMModels, invokeLLM: mocks.invokeLLM }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  const now = new Date("2026-08-23T00:00:00.000Z");
  return { user: { id: 55, openId: "audit-user", email: "audit@example.com", name: "Audit User", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("authenticated audit and advisory integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listAuditLogsForUser.mockResolvedValue([{ id: 1, eventType: "live_order_adapter", outcome: "unavailable", broker: "binance", symbol: "BTCUSDT", message: "Adapter disabled", createdAt: new Date("2026-08-23T00:00:00.000Z") }]);
    mocks.listLLMModels.mockResolvedValue({ data: [] });
  });

  it("retrieves only the authenticated user’s recent audit fields", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.audit.listRecent({ limit: 10 })).resolves.toEqual([{ id: "1", eventType: "live_order_adapter", outcome: "unavailable", broker: "binance", symbol: "BTCUSDT", message: "Adapter disabled", createdAt: expect.any(Date) }]);
    expect(mocks.listAuditLogsForUser).toHaveBeenCalledWith(55);
  });

  it("returns a typed precondition error when advisory models are unavailable", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.signals.generate({ symbol: "BTCUSDT", price: 60_000, change24h: 1 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED", message: "No advisory model is available." });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });
});
