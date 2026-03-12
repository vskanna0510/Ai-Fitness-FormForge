import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { TrpcContext } from "../context";

const t = initTRPC.context<TrpcContext>().create();

export const analyticsRouter = t.router({
  summaryForUser: t.procedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const sessions = await ctx.prisma.workoutSession.findMany({
        where: { userId: input.userId },
        orderBy: { startedAt: "desc" },
        take: 50
      });

      const totalReps = sessions.reduce((sum, s) => sum + s.totalReps, 0);
      const avgFormScore =
        sessions.length === 0
          ? 0
          : sessions.reduce((sum, s) => sum + s.avgFormScore, 0) /
            sessions.length;

      return {
        totalReps,
        avgFormScore,
        recentSessions: sessions
      };
    })
});

export type AnalyticsRouter = typeof analyticsRouter;

