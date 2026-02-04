/**
 * Database client using Drizzle ORM with postgres.js
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let connection: ReturnType<typeof postgres> | null = null;

/**
 * Get database connection (singleton pattern)
 */
export function getDatabase(connectionString: string) {
  if (!dbInstance) {
    connection = postgres(connectionString);
    dbInstance = drizzle(connection, { schema });
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (connection) {
    await connection.end();
    connection = null;
    dbInstance = null;
  }
}

/**
 * Export database type for use in tRPC context and elsewhere
 */
export type Database = ReturnType<typeof getDatabase>;
