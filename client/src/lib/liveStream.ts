import { getReconnectDelay } from "../../../shared/liveStream";

export type StreamSocket = {
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: (() => void) | null;
  onclose: (() => void) | null;
  close: () => void;
};

export type ResilientStreamStatus = "connecting" | "live" | "offline";

interface ResilientStreamOptions {
  url: string;
  onData: (data: string) => void;
  onStatus: (status: ResilientStreamStatus) => void;
  socketFactory?: (url: string) => StreamSocket;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
}

export function createResilientWebSocketStream({
  url,
  onData,
  onStatus,
  socketFactory = (socketUrl) => new WebSocket(socketUrl) as unknown as StreamSocket,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
}: ResilientStreamOptions) {
  let disposed = false;
  let socket: StreamSocket | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleReconnect = () => {
    if (disposed || reconnectTimer) return;
    onStatus("offline");
    const delay = getReconnectDelay(reconnectAttempt);
    reconnectAttempt += 1;
    reconnectTimer = setTimeoutFn(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };

  const connect = () => {
    if (disposed) return;
    onStatus("connecting");
    socket = socketFactory(url);
    socket.onopen = () => {
      reconnectAttempt = 0;
      onStatus("live");
    };
    socket.onmessage = (event) => onData(event.data);
    socket.onerror = scheduleReconnect;
    socket.onclose = scheduleReconnect;
  };

  connect();

  return {
    close() {
      disposed = true;
      if (reconnectTimer) clearTimeoutFn(reconnectTimer);
      reconnectTimer = null;
      socket?.close();
    },
    reconnectNow() {
      if (disposed) return;
      if (reconnectTimer) clearTimeoutFn(reconnectTimer);
      reconnectTimer = null;
      socket?.close();
      connect();
    },
  };
}
