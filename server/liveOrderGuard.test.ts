import { afterEach, describe, expect, it } from "vitest";
import { assertLiveOrderAllowed, checkLiveOrderReadiness } from "./liveOrderGuard";

const credentialKeys = [
  "BINANCE_API_KEY",
  "BINANCE_API_SECRET",
  "COINBASE_API_KEY",
  "COINBASE_API_SECRET",
  "KRAKEN_API_KEY",
  "KRAKEN_API_SECRET",
] as const;

const originalValues = Object.fromEntries(credentialKeys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of credentialKeys) {
    const value = originalValues[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("live order guard", () => {
  it("rejects a placeholder-only broker configuration", () => {
    delete process.env.BINANCE_API_KEY;
    delete process.env.BINANCE_API_SECRET;

    const result = checkLiveOrderReadiness({
      broker: "binance",
      dailyLossLimit: 1000,
      dailyLossUsed: 0,
      explicitConfirmation: true,
    });

    expect(result.ready).toBe(false);
    expect(result.reasons[0]).toContain("No verified binance credentials");
    expect(() => assertLiveOrderAllowed({
      broker: "binance",
      dailyLossLimit: 1000,
      dailyLossUsed: 0,
      explicitConfirmation: true,
    })).toThrow("No verified binance credentials");
  });

  it("pauses trading when the daily loss limit is reached", () => {
    process.env.BINANCE_API_KEY = "configured-for-test";
    process.env.BINANCE_API_SECRET = "configured-for-test";

    const result = checkLiveOrderReadiness({
      broker: "binance",
      dailyLossLimit: 1000,
      dailyLossUsed: 1000,
      explicitConfirmation: true,
    });

    expect(result.ready).toBe(false);
    expect(result.reasons).toContain("The daily loss limit has been reached; live trading is paused.");
  });

  it("requires explicit confirmation for each live order", () => {
    process.env.BINANCE_API_KEY = "configured-for-test";
    process.env.BINANCE_API_SECRET = "configured-for-test";

    const result = checkLiveOrderReadiness({
      broker: "binance",
      dailyLossLimit: 1000,
      dailyLossUsed: 10,
      explicitConfirmation: false,
    });

    expect(result.ready).toBe(false);
    expect(result.reasons).toContain("Explicit confirmation is required for this real order.");
  });
});
