import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const adapter = new PrismaPg({ connectionString });
  globalForPrisma.prisma = new PrismaClient({ adapter });
  return globalForPrisma.prisma;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
