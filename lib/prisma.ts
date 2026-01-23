import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = (() => {
  if (globalForPrisma.prisma && (globalForPrisma.prisma as any).redeemCode) {
    return globalForPrisma.prisma;
  }

  return new PrismaClient();
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
