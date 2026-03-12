import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { TrpcContext } from "../context";

const t = initTRPC.context<TrpcContext>().create();

export const programRouter = t.router({
  listPrograms: t.procedure
    .input(
      z.object({
        userId: z.string()
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.program.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" }
      });
    })
});

export type ProgramRouter = typeof programRouter;

