import React from "react";
import ReactDOMServer from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

type MockLinkProps = { href: string; children?: React.ReactNode; [key: string]: unknown };

vi.mock("wouter", () => ({
  Link: ({ href, children, ...props }: MockLinkProps) => React.createElement("a", { href, ...props }, children),
  useLocation: () => ["/", () => undefined],
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test Trader", email: "trader@example.com" },
    loading: false,
    isAuthenticated: true,
    logout: async () => undefined,
  }),
}));

import Navigation from "../client/src/components/Navigation";
import PortfolioHoldings from "../client/src/components/PortfolioHoldings";
import Watchlist from "../client/src/components/Watchlist";

const render = (element: React.ReactElement) => ReactDOMServer.renderToStaticMarkup(element);

describe("responsive production contracts", () => {
  it("exposes mobile navigation and safe paper-mode copy", () => {
    const markup = render(React.createElement(Navigation));
    expect(markup).toContain("Open navigation menu");
    expect(markup).toContain("href=\"/settings\"");
    expect(markup).toContain("Edge Atlas");
    expect(markup).toContain("href=\"/projects\"");
    expect(markup).toContain("href=\"/frameworks\"");
    expect(markup).toContain("href=\"/prompt-skills\"");
    expect(markup).toContain("touch-target");
  });

  it("does not render seeded portfolio holdings", () => {
    const markup = render(React.createElement(PortfolioHoldings));
    expect(markup).toContain("Positions will appear here");
    expect(markup).toContain("No synthetic account values");
    expect(markup).not.toContain("62,715");
    expect(markup).not.toContain("Bitcoin");
  });

  it("does not render seeded or randomly generated watchlist records", () => {
    const markup = render(React.createElement(Watchlist));
    expect(markup).toContain("Build your watchlist");
    expect(markup).toContain("Loading live asset metadata");
    expect(markup).not.toContain("Math.random");
    expect(markup).not.toContain("My Watchlist (3)");
  });
});
