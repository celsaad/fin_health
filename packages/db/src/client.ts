/**
 * Database client using Prisma ORM
 */

import { PrismaClient } from './generated/prisma';

let prisma: PrismaClient | null = null;

/**
 * Get database connection (singleton pattern)
 * Connection string is configured via DATABASE_URL environment variable
 */
export function getDatabase(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Export Prisma client instance
 */
export { prisma };

/**
 * Export database type for use in tRPC context and elsewhere
 */
export type Database = PrismaClient;
