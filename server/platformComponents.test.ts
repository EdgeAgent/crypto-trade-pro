import { describe, expect, it } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import CopyTradingDashboard from "../client/src/components/CopyTradingDashboard";
import BotBuilder from "../client/src/components/BotBuilder";
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

  it("supports the complete bot lifecycle", () => {
    expect(transitionBotStatus("staged", "activate")).toBe("active");
    expect(transitionBotStatus("active", "pause")).toBe("paused");
    expect(transitionBotStatus("paused", "resume")).toBe("active");
    expect(transitionBotStatus("active", "stop")).toBe("stopped");
    expect(transitionBotStatus("stopped", "restart")).toBe("active");
    expect(transitionBotStatus("staged", "stop")).toBe("staged");
  });
});
