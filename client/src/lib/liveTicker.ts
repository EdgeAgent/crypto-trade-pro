import type { ResilientStreamStatus } from "@/lib/liveStream";

export interface LiveTickerData {
  price: number;
  change24h: number;
  eventTime: number;
}

export type LiveTickerSource = "websocket" | "coingecko-rest" | null;

export interface LiveTickerState {
  status: ResilientStreamStatus;
  data: LiveTickerData | null;
  source: LiveTickerSource;
}

export const initialLiveTickerState: LiveTickerState = { status: "connecting", data: null, source: null };

export type LiveTickerEvent =
  | { type: "reset" }
  | { type: "transport-status"; status: ResilientStreamStatus }
  | { type: "stream-data"; data: LiveTickerData }
  | { type: "fallback-data"; data: LiveTickerData }
  | { type: "fallback-error" };

export function reduceLiveTickerState(state: LiveTickerState, event: LiveTickerEvent): LiveTickerState {
  if (event.type === "reset") return initialLiveTickerState;
  if (event.type === "stream-data") return { status: "live", data: event.data, source: "websocket" };
  if (event.type === "fallback-data") return { status: "live", data: event.data, source: "coingecko-rest" };
  if (event.type === "transport-status") return { ...state, status: event.status };
  if (event.type === "fallback-error") return state.data ? state : { ...state, status: "offline" };
  return state;
}

export function parseBinanceTicker(payload: unknown): LiveTickerData | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as { c?: unknown; P?: unknown; E?: unknown };
  const price = Number(data.c);
  const change24h = Number(data.P);
  const eventTime = Number(data.E);
  if (!Number.isFinite(price) || !Number.isFinite(change24h) || !Number.isFinite(eventTime)) return null;
  return { price, change24h, eventTime };
}
