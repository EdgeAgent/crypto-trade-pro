import { TRPCError } from "@trpc/server";
import type { LiveReadinessResult } from "../shared/liveReadiness";

export type SupportedBroker = "binance" | "coinbase" | "kraken";

const brokerCredentialEnv: Record<SupportedBroker, string[]> = {
  binance: ["BINANCE_API_KEY", "BINANCE_API_SECRET"],
  coinbase: ["COINBASE_API_KEY", "COINBASE_API_SECRET"],
  kraken: ["KRAKEN_API_KEY", "KRAKEN_API_SECRET"],
};

export function brokerHasServerCredentials(broker: SupportedBroker): boolean {
  return brokerCredentialEnv[broker].every((key) => Boolean(process.env[key]?.trim()));
}

export function checkLiveOrderReadiness(input: {
  broker: SupportedBroker;
  dailyLossLimit: number;
  dailyLossUsed: number;
  explicitConfirmation: boolean;
}): LiveReadinessResult {
  const reasons: string[] = [];

  if (!brokerHasServerCredentials(input.broker)) {
    reasons.push(`No verified ${input.broker} credentials are configured on the server.`);
  }

  if (!Number.isFinite(input.dailyLossLimit) || input.dailyLossLimit <= 0) {
    reasons.push("A positive daily loss limit is required.");
  }

  if (!Number.isFinite(input.dailyLossUsed) || input.dailyLossUsed < 0) {
    reasons.push("Current daily loss usage is invalid.");
  } else if (input.dailyLossUsed >= input.dailyLossLimit) {
    reasons.push("The daily loss limit has been reached; live trading is paused.");
  }

  if (!input.explicitConfirmation) {
    reasons.push("Explicit confirmation is required for this real order.");
  }

  return { ready: reasons.length === 0, reasons };
}

export function assertLiveOrderAllowed(input: Parameters<typeof checkLiveOrderReadiness>[0]): void {
  const result = checkLiveOrderReadiness(input);
  if (!result.ready) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: result.reasons.join(" "),
    });
  }
}
