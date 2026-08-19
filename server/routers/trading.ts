import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { assertLiveOrderAllowed, type SupportedBroker } from "../liveOrderGuard";

// Paper Trading Engine
export const tradingRouter = router({
  // Place a market order
  placeMarketOrder: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        side: z.enum(["BUY", "SELL"]),
        quantity: z.number().positive(),
        price: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate user has sufficient balance for buy orders
      if (input.side === "BUY") {
        const totalCost = input.quantity * input.price;
        if (totalCost > 1000) {
          // Mock starting balance
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient balance for this trade",
          });
        }
      }

      // Create trade record
      const trade = {
        id: Math.random().toString(36).substr(2, 9),
        userId: ctx.user.id,
        symbol: input.symbol,
        side: input.side,
        quantity: input.quantity,
        price: input.price,
        totalValue: input.quantity * input.price,
        status: "FILLED",
        type: "MARKET",
        timestamp: new Date(),
        executionPrice: input.price,
      };

      return {
        success: true,
        trade,
        message: `${input.side} order for ${input.quantity} ${input.symbol} executed at $${input.price}`,
      };
    }),

  // Place a limit order
  placeLimitOrder: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        side: z.enum(["BUY", "SELL"]),
        quantity: z.number().positive(),
        limitPrice: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = {
        id: Math.random().toString(36).substr(2, 9),
        userId: ctx.user.id,
        symbol: input.symbol,
        side: input.side,
        quantity: input.quantity,
        limitPrice: input.limitPrice,
        status: "PENDING",
        type: "LIMIT",
        createdAt: new Date(),
      };

      return {
        success: true,
        order,
        message: `Limit order created for ${input.quantity} ${input.symbol} at $${input.limitPrice}`,
      };
    }),

  // Live market order path. Credentials and risk gates are checked on the server before any adapter can submit an order.
  placeLiveMarketOrder: protectedProcedure
    .input(
      z.object({
        broker: z.enum(["binance", "coinbase", "kraken"]),
        symbol: z.string().min(3),
        side: z.enum(["BUY", "SELL"]),
        quantity: z.number().positive(),
        price: z.number().positive(),
        dailyLossLimit: z.number().positive(),
        dailyLossUsed: z.number().nonnegative(),
        explicitConfirmation: z.literal(true),
      })
    )
    .mutation(async ({ input }) => {
      assertLiveOrderAllowed({
        broker: input.broker as SupportedBroker,
        dailyLossLimit: input.dailyLossLimit,
        dailyLossUsed: input.dailyLossUsed,
        explicitConfirmation: input.explicitConfirmation,
      });

      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Live execution adapter is not enabled for this environment. Configure and validate a broker connection before enabling real orders.",
      });
    }),

  // Cancel an order
  cancelOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: `Order ${input.orderId} cancelled successfully`,
      };
    }),

  // Get user's trades
  getTrades: protectedProcedure.query(async ({ ctx }) => {
    // Mock trades data
    return {
      trades: [
        {
          id: "1",
          symbol: "BTC",
          side: "BUY",
          quantity: 0.5,
          price: 62715,
          totalValue: 31357.5,
          status: "FILLED",
          timestamp: new Date(Date.now() - 86400000),
          pnl: 500,
          pnlPercent: 1.59,
        },
      ],
    };
  }),

  // Get open positions
  getPositions: protectedProcedure.query(async ({ ctx }) => {
    return {
      positions: [
        {
          symbol: "BTC",
          quantity: 0.5,
          entryPrice: 62715,
          currentPrice: 62715,
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
          side: "LONG",
        },
      ],
    };
  }),

  // Get pending orders
  getPendingOrders: protectedProcedure.query(async ({ ctx }) => {
    return {
      orders: [],
    };
  }),
});
