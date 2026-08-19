import { describe, expect, it } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Settings from "../client/src/pages/Settings";
import RiskDashboard from "../client/src/components/RiskDashboard";

describe("Settings live-readiness UI", () => {
  it("renders broker and OpenRouter placeholders without connected credentials", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(Settings));

    expect(markup).toContain("Binance");
    expect(markup).toContain("Coinbase Advanced");
    expect(markup).toContain("Kraken");
    expect(markup).toContain("OpenRouter API key (placeholder)");
    expect(markup).toContain("NVIDIA Nemotron 3 8B");
    expect(markup).toContain("UI placeholder only · not connected");
  });

  it("keeps GO LIVE locked until a verified broker is connected", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(Settings));

    expect(markup).toContain("CONFIGURE BROKER TO UNLOCK");
    expect(markup).toContain("Live mode is gated until configuration is complete");
    expect(markup).toContain("Real-capital disclosure");
  });

  it("shows risk alerts without inventing live loss data", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
      React.createElement(RiskDashboard, {
        dailyLossLimit: 1000,
        dailyLossUsed: null,
        brokerConnected: false,
        maxPositionSize: 5,
      })
    );

    expect(markup).toContain("Risk Dashboard");
    expect(markup).toContain("Broker status");
    expect(markup).toContain("Not connected");
    expect(markup).toContain("Live loss data will appear after a verified broker connection.");
    expect(markup).toContain("no synthetic performance is shown");
  });
});
