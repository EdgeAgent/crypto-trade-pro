import { describe, expect, it } from "vitest";
import { applySecurityHeaders } from "./_core/securityHeaders";

describe("HTTP security headers", () => {
  it("applies baseline headers in development without HSTS", () => {
    const headers = new Map<string, string>();
    applySecurityHeaders((name, value) => headers.set(name, value), false);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.has("Strict-Transport-Security")).toBe(false);
  });

  it("adds HSTS in production", () => {
    const headers = new Map<string, string>();
    applySecurityHeaders((name, value) => headers.set(name, value), true);
    expect(headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains");
  });
});
