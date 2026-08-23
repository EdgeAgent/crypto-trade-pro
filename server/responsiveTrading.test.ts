import React from "react";
import ReactDOMServer from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    trading: {
      placeLiveMarketOrder: {
        useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
      },
    },
  },
}));

vi.mock("@/hooks/useLiveTicker", () => ({
  useLiveTicker: () => ({ status: "connecting", data: null }),
}));

vi.mock("@/components/LiveQuotePanel", () => ({
  default: ({ symbol }: { symbol: string }) => React.createElement("div", { "data-testid": "live-quote" }, `Waiting for live quote ${symbol}`),
}));

vi.mock("@/components/OrderBook", () => ({
  default: ({ symbol }: { symbol: string }) => React.createElement("div", { "data-testid": "order-book" }, `Order book ${symbol}`),
}));

vi.mock("@/components/RecentTrades", () => ({
  default: ({ symbol }: { symbol: string }) => React.createElement("div", { "data-testid": "recent-trades" }, `Recent trades ${symbol}`),
}));

import Trading from "../client/src/pages/Trading";

describe("responsive Trading page contracts", () => {
  it("keeps live execution guarded and form controls touch-sized", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(Trading));
    expect(markup).toContain("Live execution is locked");
    expect(markup).toContain("Configure broker to review live order");
    expect(markup).toContain("Placeholder fields never submit an order");
    expect(markup).toContain("touch-target");
    expect(markup).toContain("min-h-12");
    expect(markup).toContain("Stage paper buy order");
  });
});
