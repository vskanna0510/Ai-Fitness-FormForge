import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { TrpcContext } from "../context";

const t = initTRPC.context<TrpcContext>().create();

export const userRouter = t.router({
  me: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) return null;
    return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
  }),

  upsertUser: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.upsert({
        where: { email: input.email },
        update: { name: input.name },
        create: {
          email: input.email,
          name: input.name
        }
      });
    })
});

export type UserRouter = typeof userRouter;

