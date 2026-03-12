import type { FastifyRequest } from "fastify";
import type { PrismaClientType } from "../db/client";
import { prisma } from "../db/client";

export interface TrpcContext {
  prisma: PrismaClientType;
  userId: string | null;
}

export async function createContext(opts: { req: FastifyRequest }): Promise<TrpcContext> {
  // TODO: plug real auth here. For now, anonymous context.
  return {
    prisma,
    userId: null
  };
}

