import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type PrismaClientType = typeof prisma;

export { prisma };

