/**
 * Main entry point for @fin-health/db package
 */

// Export database client functions and Prisma types
export { getDatabase, closeDatabase, prisma, type Database } from './client.js';

// Re-export commonly used Prisma types
export type { Prisma, User, Category, Subcategory, Budget, BudgetAllocation, Expense } from './generated/prisma/index.js';
