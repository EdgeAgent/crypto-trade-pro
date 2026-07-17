import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

// Copy Trading System
export const copyTradingRouter = router({
  // Get list of top traders
  getTopTraders: protectedProcedure.query(async ({ ctx }) => {
    return {
      traders: [
        {
          id: "trader-1",
          name: "VolumeAnalyst",
          strategy: "Technical Analysis",
          winRate: 71,
          monthlyReturn: 31.2,
          followers: 8950,
          reputation: 4.5,
          totalTrades: 428,
          isFollowing: false,
        },
        {
          id: "trader-2",
          name: "CryptoMaster",
          strategy: "Scalping",
          winRate: 68,
          monthlyReturn: 24.5,
          followers: 5420,
          reputation: 4.3,
          totalTrades: 342,
          isFollowing: false,
        },
        {
          id: "trader-3",
          name: "TrendFollower",
          strategy: "Swing Trading",
          winRate: 62,
          monthlyReturn: 18.3,
          followers: 3120,
          reputation: 4.0,
          totalTrades: 215,
          isFollowing: false,
        },
      ],
    };
  }),

  // Follow a trader
  followTrader: protectedProcedure
    .input(z.object({ traderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: `You are now following trader ${input.traderId}`,
      };
    }),

  // Unfollow a trader
  unfollowTrader: protectedProcedure
    .input(z.object({ traderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: `You have unfollowed trader ${input.traderId}`,
      };
    }),

  // Copy a trade
  copyTrade: protectedProcedure
    .input(
      z.object({
        traderId: z.string(),
        tradeId: z.string(),
        quantity: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        copyId: Math.random().toString(36).substr(2, 9),
        message: `Trade copied from ${input.traderId}`,
      };
    }),

  // Get my active copies
  getActiveCopies: protectedProcedure.query(async ({ ctx }) => {
    return {
      copies: [
        {
          id: "copy-1",
          traderId: "trader-1",
          traderName: "VolumeAnalyst",
          symbol: "BTC",
          side: "BUY",
          quantity: 0.5,
          entryPrice: 62715,
          currentPrice: 62715,
          pnl: 0,
          pnlPercent: 0,
          status: "ACTIVE",
          copiedAt: new Date(Date.now() - 3600000),
        },
      ],
    };
  }),

  // Get copy history
  getCopyHistory: protectedProcedure.query(async ({ ctx }) => {
    return {
      history: [
        {
          id: "copy-hist-1",
          traderId: "trader-1",
          traderName: "VolumeAnalyst",
          symbol: "ETH",
          side: "SELL",
          quantity: 2,
          entryPrice: 1811.7,
          exitPrice: 1850,
          pnl: 76.6,
          pnlPercent: 2.1,
          status: "CLOSED",
          copiedAt: new Date(Date.now() - 86400000),
          closedAt: new Date(Date.now() - 43200000),
        },
      ],
    };
  }),
});
