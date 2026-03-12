import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./context";
import { userRouter } from "./routers/user";
import { workoutRouter } from "./routers/workout";
import { programRouter } from "./routers/program";
import { analyticsRouter } from "./routers/analytics";

const t = initTRPC.context<TrpcContext>().create();

export const appRouter = t.router({
  user: userRouter,
  workout: workoutRouter,
  program: programRouter,
  analytics: analyticsRouter
});

export type AppRouter = typeof appRouter;

