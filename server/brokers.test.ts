import { describe, expect, it } from "vitest";
import { brokerAdapters, getBrokerAdapter } from "./brokers";

describe("broker adapter boundary", () => {
  it("registers Binance, Coinbase, and Kraken as disabled adapters", () => {
    expect(Object.keys(brokerAdapters).sort()).toEqual(["binance", "coinbase", "kraken"]);
    expect(Object.values(brokerAdapters).every((adapter) => adapter.enabled === false)).toBe(true);
  });

  it("refuses live submission through the disabled adapter contract", async () => {
    await expect(getBrokerAdapter("binance").submitMarketOrder({ symbol: "BTC/USDT", side: "BUY", quantity: 0.001, price: 60_000 })).rejects.toThrow("live execution adapter is disabled");
  });
});
