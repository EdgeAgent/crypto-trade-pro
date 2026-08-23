import { describe, expect, it, beforeEach } from "vitest";
import { assertRequestAllowed, resetRequestLimits } from "./requestRateLimit";

describe("request rate limits", () => {
  beforeEach(() => resetRequestLimits());

  it("rejects after the configured number of attempts in a window", () => {
    for (let i = 0; i < 3; i += 1) assertRequestAllowed(7, "advisory-generation", 3, 60_000, 1000);
    expect(() => assertRequestAllowed(7, "advisory-generation", 3, 60_000, 1000)).toThrow("Request limit reached");
  });

  it("isolates users and actions", () => {
    assertRequestAllowed(7, "live-order", 1, 60_000, 1000);
    expect(() => assertRequestAllowed(7, "live-order", 1, 60_000, 1000)).toThrow();
    expect(() => assertRequestAllowed(8, "live-order", 1, 60_000, 1000)).not.toThrow();
    expect(() => assertRequestAllowed(7, "advisory-generation", 1, 60_000, 1000)).not.toThrow();
  });

  it("resets after the time window", () => {
    assertRequestAllowed(7, "live-order", 1, 60_000, 1000);
    expect(() => assertRequestAllowed(7, "live-order", 1, 60_000, 61_000)).not.toThrow();
  });
});
