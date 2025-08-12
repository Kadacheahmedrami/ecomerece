// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow a global prisma var across HMR in development
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// use globalThis so it works both in Node and other runtimes
export const prisma: PrismaClient = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
