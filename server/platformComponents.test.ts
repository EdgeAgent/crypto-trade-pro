import { describe, expect, it } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import CopyTradingDashboard from "../client/src/components/CopyTradingDashboard";
import BotBuilder from "../client/src/components/BotBuilder";
import PerformanceAnalytics from "../client/src/components/PerformanceAnalytics";
import BotPerformancePanel from "../client/src/components/BotPerformancePanel";
import { transitionBotStatus } from "../shared/botLifecycle";

describe("platform component safety states", () => {
  it("renders honest empty states for staged copy plans", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(CopyTradingDashboard, { copiedTraders: [], onStopCopy: () => undefined }));
    expect(markup).toContain("Persisted plans");
    expect(markup).toContain("No staged copy plans yet");
    expect(markup).toContain("No broker-linked position or performance data is available");
  });

  it("renders persisted active-copy rows and intent history separately from broker performance", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(CopyTradingDashboard, { copiedTraders: [{ id: "trader-1", name: "Registry Trader", avatar: "RT", strategy: "Momentum", winRate: 62, monthlyReturn: 8, followers: 10, totalTrades: 20, rating: 4.5, badges: [] }], positions: [{ traderId: "trader-1", symbol: "BTC/USDT", side: "BUY", quantity: 0.2, pnl: 0 }], history: [{ id: "copy-1", traderId: "trader-1", traderName: "Registry Trader", status: "staged", createdAt: new Date("2026-01-01T00:00:00Z") }], onStopCopy: () => undefined }));
    expect(markup).toContain("Active copied positions");
    expect(markup).toContain("BTC/USDT");
    expect(markup).toContain("Persisted intent history");
    expect(markup).toContain("Registry Trader");
  });

  it("renders an honest bot performance state without execution history", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(BotPerformancePanel, {}));
    expect(markup).toContain("Bot performance");
    expect(markup).toContain("No bot execution history yet");
    expect(markup).toContain("Connect a verified broker");
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
