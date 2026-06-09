import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis;

let prismaInstance;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Database file is located at the root of the project (dev.db)
  const adapter = new PrismaBetterSqlite3({
    url: 'file:dev.db'
  });
  
  prismaInstance = new PrismaClient({
    adapter,
    log: ['query'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;
