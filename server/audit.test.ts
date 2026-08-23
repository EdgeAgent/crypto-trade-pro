import { describe, expect, it } from "vitest";
import { redactAuditMetadata } from "./db";

describe("audit metadata safety", () => {
  it("removes credential-shaped fields before persistence", () => {
    const redacted = redactAuditMetadata(JSON.stringify({ side: "BUY", apiKey: "SECRET", apiSecret: "SECRET", passphrase: "SECRET", token: "SECRET", source: "ui" }));
    expect(redacted).toBe(JSON.stringify({ side: "BUY", source: "ui" }));
    expect(redacted).not.toContain("SECRET");
  });

  it("drops malformed metadata rather than storing opaque strings", () => {
    expect(redactAuditMetadata("not-json")).toBeUndefined();
    expect(redactAuditMetadata(undefined)).toBeUndefined();
  });
});
