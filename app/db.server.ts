import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

console.log('[DB] Initializing Prisma client...');
console.log('[DB] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

console.log('[DB] Prisma client initialized');

export default prisma;
