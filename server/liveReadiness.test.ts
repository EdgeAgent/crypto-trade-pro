import { describe, expect, it } from "vitest";
import { validateLiveReadiness } from "../shared/liveReadiness";

describe("validateLiveReadiness", () => {
  it("keeps live trading locked when broker credentials are only placeholders", () => {
    const result = validateLiveReadiness({
      brokerConnected: false,
      dailyLossLimit: 1000,
      explicitConfirmation: false,
    });

    expect(result.ready).toBe(false);
    expect(result.reasons).toContain("A verified broker connection is required.");
    expect(result.reasons).toContain("Explicit real-capital confirmation is required.");
  });

  it("rejects an invalid daily loss limit", () => {
    const result = validateLiveReadiness({
      brokerConnected: true,
      dailyLossLimit: 0,
      explicitConfirmation: true,
    });

    expect(result.ready).toBe(false);
    expect(result.reasons).toContain("A positive daily loss limit is required.");
  });

  it("allows readiness only when every gate is satisfied", () => {
    const result = validateLiveReadiness({
      brokerConnected: true,
      dailyLossLimit: 1000,
      explicitConfirmation: true,
    });

    expect(result).toEqual({ ready: true, reasons: [] });
  });
});
