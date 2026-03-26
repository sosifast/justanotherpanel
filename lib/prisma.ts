import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  // During Vercel build/export there may be no DB connectivity yet (or network may be slow).
  // Make sure pg connects quickly so Next.js won't hit the >60s export timeout.
  const connectionTimeoutMillis = Number(process.env.PG_CONNECTION_TIMEOUT_MS ?? 5000);
  const statementTimeoutMs = Number(process.env.PG_STATEMENT_TIMEOUT_MS ?? 5000);

  // If DATABASE_URL is not set, fall back to Prisma's default connection handling.
  // The first query will still fail, but importing this module won't crash the build.
  if (!connectionString) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis,
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    max: 20, // Limit connections per serverless function instance
    // Recommended for cloud providers as some drop unused connections or require SSL
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') 
      ? false 
      : { rejectUnauthorized: false },
    // Apply a statement timeout to avoid long-running queries during build.
    // `options` is passed directly to the pg client as `-c key=value`.
    options: `-c statement_timeout=${statementTimeoutMs}`,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
