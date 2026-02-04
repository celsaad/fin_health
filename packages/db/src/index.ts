/**
 * Main entry point for @fin-health/db package
 */

// Export all schema tables and types
export * from './schema.js';

// Export database client functions
export { getDatabase, closeDatabase, type Database } from './client.js';
