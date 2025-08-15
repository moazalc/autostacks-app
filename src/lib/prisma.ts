import { PrismaClient } from "../../generated/prisma"; // <- adjust path if needed

import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  // allow caching in dev without using `any`
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const _prismaInstance =
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  }).$extends(withAccelerate());

// In dev, stash on the global object. Use `unknown` casts to avoid `any`.
if (process.env.NODE_ENV !== "production") {
  (globalThis as unknown as { prisma?: PrismaClient }).prisma =
    _prismaInstance as unknown as PrismaClient;
}

// Export the runtime instance. Cast to PrismaClient so other files get the expected type.
export const prisma = _prismaInstance as unknown as PrismaClient;
export default prisma;
