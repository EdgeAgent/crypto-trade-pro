import type { Express, Request, Response } from "express";
import { EventEmitter } from "node:events";

export interface PublishedSignalEvent {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  provider: string;
  model: string;
}

const signalEvents = new EventEmitter();
signalEvents.setMaxListeners(0);

export function publishSignalEvent(signal: PublishedSignalEvent) {
  signalEvents.emit("signal", signal);
}

export function subscribeSignalEvents(listener: (signal: PublishedSignalEvent) => void) {
  signalEvents.on("signal", listener);
  return () => signalEvents.off("signal", listener);
}

export function registerSignalEventStream(app: Express) {
  app.get("/api/signals/stream", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(`event: ready\ndata: {"status":"connected"}\n\n`);

    const onSignal = (signal: PublishedSignalEvent) => res.write(`event: signal\ndata: ${JSON.stringify(signal)}\n\n`);
    const heartbeat = setInterval(() => res.write(": keepalive\n\n"), 15_000);
    const unsubscribe = subscribeSignalEvents(onSignal);
    res.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
      res.end();
    });
  });
}
