import { describe, expect, it } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import RecentTrades from "../client/src/components/RecentTrades";
import OrderBook from "../client/src/components/OrderBook";
import LiveQuotePanel from "../client/src/components/LiveQuotePanel";
import { ChartDataState, OhlcChartCanvas } from "../client/src/components/CandlestickChart";
import { getReconnectDelay } from "../shared/liveStream";
import { createResilientWebSocketStream, type StreamSocket } from "../client/src/lib/liveStream";
import { initialLiveTickerState, parseBinanceTicker, reduceLiveTickerState } from "../client/src/lib/liveTicker";
import { calculateTechnicalIndicators, getOhlcDays, parseCoinGeckoOhlc } from "../client/src/lib/ohlc";

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

  it("parses valid ticker payloads and rejects malformed payloads", () => {
    expect(parseBinanceTicker({ c: "62000.50", P: "2.5", E: 123 })).toEqual({ price: 62000.5, change24h: 2.5, eventTime: 123 });
    expect(parseBinanceTicker({ c: "not-a-price", P: "2.5", E: 123 })).toBeNull();
    expect(parseBinanceTicker(null)).toBeNull();
  });

  it("parses provider OHLC rows and maps chart timeframes", () => {
    const candles = parseCoinGeckoOhlc([[1700000000000, "62000", "62500", "61800", "62300"], ["bad", 1, 2, 3, 4], [1700000001000, 62000, 62500, 61800, 62300]]);
    expect(candles).toHaveLength(2);
    expect(candles[0]?.close).toBe(62300);
    expect(getOhlcDays("1H")).toBe(1);
    expect(getOhlcDays("4H")).toBe(7);
    expect(getOhlcDays("1D")).toBe(30);
    expect(getOhlcDays("1W")).toBe(90);
  });

  it("calculates RSI, MACD, and Bollinger values only from available OHLC history", () => {
    const candles = Array.from({ length: 40 }, (_, index) => ({ time: `t${index}`, timestamp: index, open: 100 + index, high: 101 + index, low: 99 + index, close: 100 + index }));
    const indicators = calculateTechnicalIndicators(candles);
    expect(indicators[0]?.rsi).toBeNull();
    expect(indicators[13]?.rsi).toBeNull();
    expect(indicators[14]?.rsi).toBe(100);
    expect(indicators[19]?.bollingerMiddle).toBe(109.5);
    expect(indicators[25]?.macd).not.toBeNull();
    expect(indicators[39]?.macdSignal).not.toBeNull();
    expect(Number.isFinite(indicators[39]?.bollingerUpper ?? NaN)).toBe(true);
    expect(Number.isFinite(indicators[39]?.bollingerLower ?? NaN)).toBe(true);
  });

  it("renders the dedicated empty OHLC state", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(ChartDataState, { status: "empty", error: "No candles were returned." }));
    expect(markup).toContain("No candles for this timeframe");
    expect(markup).toContain("No candles were returned.");
  });

  it("transitions selected-pair ticker state through connecting, offline, REST fallback, and WebSocket live", () => {
    let state = initialLiveTickerState;
    expect(state.status).toBe("connecting");
    state = reduceLiveTickerState(state, { type: "fallback-error" });
    expect(state.status).toBe("offline");
    state = reduceLiveTickerState(state, { type: "fallback-data", data: { price: 62000, change24h: 1.2, eventTime: 123 } });
    expect(state.status).toBe("live");
    expect(state.source).toBe("coingecko-rest");
    state = reduceLiveTickerState(state, { type: "stream-data", data: { price: 62001, change24h: 1.3, eventTime: 124 } });
    expect(state.source).toBe("websocket");
  });

  it("renders provider-backed live quote content instead of the waiting state", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(LiveQuotePanel, { symbol: "BTC/USDT", ticker: { status: "live", source: "coingecko-rest", data: { price: 62000.5, change24h: 2.5, eventTime: 123 } } }));
    expect(markup).toContain("BTC/USDT");
    expect(markup).toContain("62,000.5");
    expect(markup).not.toContain("Waiting for live quote");
  });

  it("renders live chart output and an honest unavailable chart state", () => {
    const liveMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(OhlcChartCanvas, { change24h: 2.5, candles: [
      { timestamp: 1700000000000, time: "Nov 14, 2023", open: 62000, high: 62500, low: 61800, close: 62300 },
      { timestamp: 1700003600000, time: "Nov 14, 2023", open: 62300, high: 62800, low: 62100, close: 62700 },
    ] }));
    expect(liveMarkup).toContain('data-testid="ohlc-chart-canvas"');
    expect(liveMarkup).toContain('data-candle-count="2"');
    const indicatorMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(OhlcChartCanvas, { change24h: 2.5, visibleIndicators: { rsi: true, macd: true, bollinger: true }, candles: Array.from({ length: 40 }, (_, index) => ({ time: `t${index}`, timestamp: index, open: 100 + index, high: 101 + index, low: 99 + index, close: 100 + index })) }));
    expect(indicatorMarkup).not.toContain("selected indicator needs more live provider history");
    expect(indicatorMarkup).toContain('class="h-[300px] w-full"');
    expect(indicatorMarkup).toContain('class="h-[100px] w-full"');
    expect(indicatorMarkup).toContain('class="h-[110px] w-full"');
    expect(indicatorMarkup).toContain('data-testid="rsi-panel"');
    expect(indicatorMarkup).toContain('data-testid="macd-panel"');
    expect(indicatorMarkup).toContain('data-testid="bollinger-overlay"');
    const insufficientMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(OhlcChartCanvas, { change24h: 2.5, visibleIndicators: { rsi: true, macd: true, bollinger: true }, candles: Array.from({ length: 10 }, (_, index) => ({ time: `t${index}`, timestamp: index, open: 100 + index, high: 101 + index, low: 99 + index, close: 100 + index })) }));
    expect(insufficientMarkup).toContain('data-testid="indicator-insufficient-history"');
    expect(insufficientMarkup).toContain("No synthetic values are shown.");
    const unavailableMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(ChartDataState, { status: "offline", error: "Provider is unavailable." }));
    expect(unavailableMarkup).toContain("Live chart unavailable");
    expect(unavailableMarkup).toContain("Provider is unavailable.");
  });

  it("renders the Trading live-quote waiting state honestly", () => {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(LiveQuotePanel, { symbol: "BTC/USDT", ticker: { ...initialLiveTickerState, status: "offline" } }));
    expect(markup).toContain("Waiting for live quote");
    expect(markup).toContain("Selected-pair ticker is unavailable");
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
