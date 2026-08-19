export type LiveStreamStatus = "connecting" | "live" | "offline";

export function getReconnectDelay(attempt: number, baseDelay = 1000, maxDelay = 30000): number {
  const normalizedAttempt = Math.max(0, Math.floor(attempt));
  const delay = baseDelay * 2 ** normalizedAttempt;
  return Math.min(delay, maxDelay);
}
