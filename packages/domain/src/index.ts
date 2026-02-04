/**
 * Main entry point for @fin-health/domain package
 */

// Types
export * from './types/index.js';

// Utilities
export * from './utils/money.js';
export * from './utils/monthKey.js';

// Calculations
export * from './calculations/budget.js';

// Operations
export * from './operations/copyForward.js';

// Schemas (export namespace to avoid conflicts)
export * as schemas from './schemas/api.js';
