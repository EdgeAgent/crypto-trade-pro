import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { listAuditLogsForUser } from "../db";

export const auditRouter = router({
  listRecent: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(50).optional() }).optional()).query(async ({ ctx, input }) => {
    const rows = await listAuditLogsForUser(ctx.user.id);
    return rows.slice(0, input?.limit ?? 25).map((row) => ({ id: String(row.id), eventType: row.eventType, outcome: row.outcome, broker: row.broker, symbol: row.symbol, message: row.message, createdAt: row.createdAt }));
  }),
});
