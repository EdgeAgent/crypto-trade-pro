import { describe, expect, it } from "vitest";
import { publishSignalEvent, subscribeSignalEvents } from "./signalEvents";

describe("signal event delivery", () => {
  it("publishes advisory signals to active subscribers and stops after cleanup", () => {
    const received: string[] = [];
    const unsubscribe = subscribeSignalEvents((signal) => received.push(signal.id));
    publishSignalEvent({ id: "signal-1", symbol: "BTCUSDT", direction: "HOLD", confidence: 61, reasoning: "The current snapshot is mixed and requires caution.", provider: "built-in-advisory", model: "gpt-5-mini" });
    unsubscribe();
    publishSignalEvent({ id: "signal-2", symbol: "BTCUSDT", direction: "BUY", confidence: 55, reasoning: "The current snapshot is modestly constructive but uncertain.", provider: "built-in-advisory", model: "gpt-5-mini" });
    expect(received).toEqual(["signal-1"]);
  });
});
