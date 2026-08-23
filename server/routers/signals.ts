import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM, listLLMModels } from "../_core/llm";
import { createTradingSignalForUser, listActiveSignals } from "../db";

export type SignalRecord = {
  id: string;
  symbol: string;
  type: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  source: string;
  createdAt: Date;
};

const signalOutput = z.object({
  direction: z.enum(["BUY", "SELL", "HOLD"]),
  confidence: z.number().min(0).max(100),
  reasoning: z.string().min(20).max(1000),
});

const marketSnapshot = z.object({
  symbol: z.string().regex(/^[A-Z0-9]{6,12}$/),
  price: z.number().positive(),
  change24h: z.number(),
  rsi: z.number().min(0).max(100).nullable().optional(),
  macd: z.number().nullable().optional(),
  bollingerPosition: z.number().nullable().optional(),
});

const contentText = (content: unknown) => typeof content === "string" ? content : Array.isArray(content) ? content.map((part) => typeof part === "object" && part && "text" in part ? String((part as { text: unknown }).text) : "").join("") : "";

export const signalsRouter = router({
  list: publicProcedure.input(z.object({ symbol: z.string().optional() }).optional()).query(async ({ input }) => {
    const signals = await listActiveSignals(input?.symbol);
    const mapped: SignalRecord[] = signals.map((signal) => ({ id: String(signal.id), symbol: signal.symbol, type: signal.direction, source: `${signal.provider} · ${signal.model}`, confidence: signal.confidenceBps / 100, reasoning: signal.reasoning, createdAt: signal.createdAt }));
    return { signals: mapped, status: mapped.length ? "live" as const : "awaiting-provider" as const, message: mapped.length ? undefined : "No signal provider is connected. Configure an advisory AI provider to populate this feed." };
  }),

  generate: protectedProcedure.input(marketSnapshot).mutation(async ({ ctx, input }) => {
    const catalog = await listLLMModels();
    const model = catalog.data.find((candidate) => candidate.id.toLowerCase().includes("nemotron"))?.id ?? catalog.data.find((candidate) => candidate.id === "gpt-5-mini")?.id ?? catalog.data[0]?.id;
    if (!model) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No advisory model is available." });

    const response = await invokeLLM({
      model,
      messages: [
        { role: "system", content: "You are an advisory crypto-market analyst. Use only the supplied live market snapshot. Return JSON only. This is informational research, not an order instruction; never claim certainty or guarantee returns." },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "advisory_signal", strict: true, schema: { type: "object", properties: { direction: { type: "string", enum: ["BUY", "SELL", "HOLD"] }, confidence: { type: "number", minimum: 0, maximum: 100 }, reasoning: { type: "string", minLength: 20, maxLength: 1000 } }, required: ["direction", "confidence", "reasoning"], additionalProperties: false } } },
    });

    const parsed = signalOutput.safeParse(JSON.parse(contentText(response.choices[0]?.message?.content)));
    if (!parsed.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The advisory provider returned an invalid signal format." });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const id = await createTradingSignalForUser({ provider: "built-in-advisory", model, symbol: input.symbol, direction: parsed.data.direction, confidenceBps: Math.round(parsed.data.confidence * 100), reasoning: parsed.data.reasoning, status: "active", expiresAt }, ctx.user.id);
    if (!id) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The advisory signal could not be persisted because the database is unavailable." });
    return { id: String(id), provider: "built-in-advisory", model, ...parsed.data, advisoryOnly: true as const };
  }),
});
