import { TRPCError } from "@trpc/server";
import type { SupportedBroker } from "./liveOrderGuard";

export type BrokerOrderRequest = { symbol: string; side: "BUY" | "SELL"; quantity: number; price: number };
export type BrokerOrderResult = { broker: SupportedBroker; providerOrderId: string; status: "submitted" | "rejected" };

export interface BrokerAdapter {
  readonly broker: SupportedBroker;
  readonly enabled: boolean;
  submitMarketOrder(request: BrokerOrderRequest): Promise<BrokerOrderResult>;
}

class DisabledBrokerAdapter implements BrokerAdapter {
  readonly enabled = false;
  constructor(readonly broker: SupportedBroker) {}

  async submitMarketOrder(_request: BrokerOrderRequest): Promise<BrokerOrderResult> {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: `${this.broker} live execution adapter is disabled until credential validation, idempotency, and settlement reconciliation are configured.` });
  }
}

export const brokerAdapters: Record<SupportedBroker, BrokerAdapter> = {
  binance: new DisabledBrokerAdapter("binance"),
  coinbase: new DisabledBrokerAdapter("coinbase"),
  kraken: new DisabledBrokerAdapter("kraken"),
};

export function getBrokerAdapter(broker: SupportedBroker) {
  return brokerAdapters[broker];
}
