export type LiveReadinessInput = {
  brokerConnected: boolean;
  dailyLossLimit: number;
  explicitConfirmation: boolean;
};

export type LiveReadinessResult = {
  ready: boolean;
  reasons: string[];
};

export function validateLiveReadiness(input: LiveReadinessInput): LiveReadinessResult {
  const reasons: string[] = [];

  if (!input.brokerConnected) {
    reasons.push("A verified broker connection is required.");
  }

  if (!Number.isFinite(input.dailyLossLimit) || input.dailyLossLimit <= 0) {
    reasons.push("A positive daily loss limit is required.");
  }

  if (!input.explicitConfirmation) {
    reasons.push("Explicit real-capital confirmation is required.");
  }

  return { ready: reasons.length === 0, reasons };
}
