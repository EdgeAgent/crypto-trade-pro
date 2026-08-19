import { describe, expect, it } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import RecentTrades from "../client/src/components/RecentTrades";
import OrderBook from "../client/src/components/OrderBook";
import { getReconnectDelay } from "../shared/liveStream";
import { createResilientWebSocketStream, type StreamSocket } from "../client/src/lib/liveStream";

describe("live stream resilience", () => {
  it("uses bounded exponential reconnect delays", () => {
    expect(getReconnectDelay(0)).toBe(1000);
    expect(getReconnectDelay(1)).toBe(2000);
    expect(getReconnectDelay(5)).toBe(30000);
    expect(getReconnectDelay(99)).toBe(30000);
  });

  it("renders a clear connecting state before the first trade tick", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(RecentTrades, { symbol: "btcusdt" }));

    expect(markup).toContain("Recent trades");
    expect(markup).toContain("Connecting");
    expect(markup).toContain("Waiting for live trades");
  });

  it("renders safe empty depth states before the order-book stream connects", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(OrderBook, { symbol: "BTC" }));

    expect(markup).toContain("BTC Order Book");
    expect(markup).toContain("Connecting");
    expect(markup).toContain("Waiting for bids");
    expect(markup).toContain("Waiting for asks");
  });

  it("transitions from connecting to live, offline, and recovered", () => {
    const sockets: StreamSocket[] = [];
    const pendingTimers: Array<() => void> = [];
    const statuses: string[] = [];
    const socketFactory = () => {
      const socket: StreamSocket = { onopen: null, onmessage: null, onerror: null, onclose: null, close: () => undefined };
      sockets.push(socket);
      return socket;
    };

    const stream = createResilientWebSocketStream({
      url: "wss://example.test/live",
      onData: () => undefined,
      onStatus: (status) => statuses.push(status),
      socketFactory,
      setTimeoutFn: (callback) => {
        pendingTimers.push(callback);
        return 1 as unknown as ReturnType<typeof setTimeout>;
      },
      clearTimeoutFn: () => undefined,
    });

    expect(statuses).toEqual(["connecting"]);
    sockets[0]?.onopen?.();
    expect(statuses.at(-1)).toBe("live");
    sockets[0]?.onerror?.();
    expect(statuses.at(-1)).toBe("offline");
    pendingTimers[0]?.();
    expect(sockets).toHaveLength(2);
    sockets[1]?.onopen?.();
    expect(statuses.at(-1)).toBe("live");
    stream.close();
  });
});
