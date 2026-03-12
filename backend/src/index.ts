import Fastify from "fastify";
import cors from "fastify-cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/context";

const PORT = Number(process.env.PORT ?? 4000);

async function start() {
  const fastify = Fastify({
    logger: true
  });

  await fastify.register(cors, {
    origin: true
  });

  await fastify.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext
    }
  });

  fastify.get("/health", async () => ({ status: "ok" }));

  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    fastify.log.info(`🚀 FormForge backend listening on ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

void start();

