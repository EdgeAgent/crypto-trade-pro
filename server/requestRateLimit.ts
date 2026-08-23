import { TRPCError } from "@trpc/server";

type Bucket = { startedAt: number; count: number };
const buckets = new Map<string, Bucket>();

export function assertRequestAllowed(userId: number, action: string, limit: number, windowMs: number, now = Date.now()) {
  const key = `${userId}:${action}`;
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    buckets.set(key, { startedAt: now, count: 1 });
    return;
  }
  if (current.count >= limit) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Request limit reached for ${action}. Try again shortly.` });
  }
  current.count += 1;
}

export function resetRequestLimits() {
  buckets.clear();
}
