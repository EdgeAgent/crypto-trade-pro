import { describe, expect, it } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import CopyTradingDashboard from "../client/src/components/CopyTradingDashboard";
import BotBuilder from "../client/src/components/BotBuilder";
import PerformanceAnalytics from "../client/src/components/PerformanceAnalytics";
import { transitionBotStatus } from "../shared/botLifecycle";

describe("platform component safety states", () => {
  it("renders honest empty states for staged copy plans", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(CopyTradingDashboard, { copiedTraders: [], onStopCopy: () => undefined }));
    expect(markup).toContain("Staged plans");
    expect(markup).toContain("No staged copy plans yet");
    expect(markup).toContain("No broker-linked position or performance data is available");
  });

  it("renders bot-builder validation before a draft can be staged", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(BotBuilder, { onCreate: () => undefined }));
    expect(markup).toContain("Strategy bot builder");
    expect(markup).toContain("Needs review");
    expect(markup).toContain("Give the bot a name");
  });

  it("renders honest locked state and live analytics for PerformanceAnalytics", () => {
    const lockedMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(PerformanceAnalytics, { brokerConnected: false }));
    expect(lockedMarkup).toContain("Performance Analytics");
    expect(lockedMarkup).toContain("Performance metrics locked");
    expect(lockedMarkup).toContain("No synthetic performance data is shown");

    const liveMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(PerformanceAnalytics, { brokerConnected: true, trades: [
      { id: "1", side: "BUY", price: 62000, quantity: 1, realizedPnl: 1200, timestamp: 1 },
      { id: "2", side: "SELL", price: 63000, quantity: 1, realizedPnl: -200, timestamp: 2 },
    ] }));
    expect(liveMarkup).toContain("Performance Analytics");
    expect(liveMarkup).toContain("+$1,000.00");
    expect(liveMarkup).toContain("125,000");
    expect(liveMarkup).toContain("50.0%");
  });

  it("supports the complete bot lifecycle", () => {
    expect(transitionBotStatus("staged", "activate")).toBe("active");
    expect(transitionBotStatus("active", "pause")).toBe("paused");
    expect(transitionBotStatus("paused", "resume")).toBe("active");
    expect(transitionBotStatus("active", "stop")).toBe("stopped");
    expect(transitionBotStatus("stopped", "restart")).toBe("active");
    expect(transitionBotStatus("staged", "stop")).toBe("staged");
  });
});
