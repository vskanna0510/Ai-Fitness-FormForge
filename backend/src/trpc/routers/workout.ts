import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { TrpcContext } from "../context";

const t = initTRPC.context<TrpcContext>().create();

export const workoutRouter = t.router({
  startSession: t.procedure
    .input(
      z.object({
        userId: z.string(),
        exerciseId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.workoutSession.create({
        data: {
          userId: input.userId,
          exerciseId: input.exerciseId
        }
      });
      return { sessionId: session.id, startedAt: session.startedAt };
    }),

  completeSession: t.procedure
    .input(
      z.object({
        sessionId: z.string(),
        totalReps: z.number().int().min(0),
        avgFormScore: z.number().min(0).max(100)
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workoutSession.update({
        where: { id: input.sessionId },
        data: {
          totalReps: input.totalReps,
          avgFormScore: input.avgFormScore
        }
      });
    }),

  saveRepEvents: t.procedure
    .input(
      z.object({
        sessionId: z.string(),
        events: z.array(
          z.object({
            time: z.string().datetime(),
            repNumber: z.number().int().min(1),
            formScore: z.number().min(0).max(100),
            keypointsJson: z.record(z.any()),
            errors: z.array(z.string())
          })
        )
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.repEvent.createMany({
        data: input.events.map(e => ({
          sessionId: input.sessionId,
          time: new Date(e.time),
          repNumber: e.repNumber,
          formScore: e.formScore,
          keypointsJson: e.keypointsJson,
          errors: e.errors
        }))
      });

      return { ok: true };
    })
});

export type WorkoutRouter = typeof workoutRouter;

