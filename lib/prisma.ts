import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = (() => {
  if (globalForPrisma.prisma && (globalForPrisma.prisma as any).redeemCode) {
    return globalForPrisma.prisma;
  }

  console.log('--- INITIALIZING NEW PRISMA CLIENT ---');
  return new PrismaClient({
    log: ['query'],
  });
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
