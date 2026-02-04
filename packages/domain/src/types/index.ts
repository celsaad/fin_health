/**
 * Core domain types for the budgeting application
 * All amounts are stored as integer cents to avoid floating point errors
 */

// ============================================================================
// User and Settings
// ============================================================================

export interface User {
  id: string;
  email: string;
  currency: string; // ISO 4217 currency code (USD, EUR, etc.)
  timezone: string; // IANA timezone (America/New_York, etc.)
  monthStartDay: number; // 1-31, day of month when budget period starts
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  currency: string;
  timezone: string;
  monthStartDay: number;
}

// ============================================================================
// Categories and Subcategories
// ============================================================================

export interface Category {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  sortOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Budget and Allocations
// ============================================================================

export interface Budget {
  id: string;
  userId: string;
  monthKey: string; // Format: "YYYY-MM"
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAllocation {
  id: string;
  budgetId: string;
  categoryId: string;
  subcategoryId: string | null;
  amountCents: number; // Money stored as integer cents
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Expenses
// ============================================================================

export interface Expense {
  id: string;
  userId: string;
  occurredAt: Date;
  amountCents: number; // Money stored as integer cents
  categoryId: string;
  subcategoryId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Computed/View Types (for displaying budget overview)
// ============================================================================

export interface SubcategoryBudgetSummary {
  subcategoryId: string;
  subcategoryName: string;
  allocatedCents: number;
  spentCents: number;
  remainingCents: number;
  percentageSpent: number;
}

export interface CategoryBudgetSummary {
  categoryId: string;
  categoryName: string;
  allocatedCents: number;
  spentCents: number;
  remainingCents: number;
  percentageSpent: number;
  subcategories: SubcategoryBudgetSummary[];
}

export interface MonthBudgetOverview {
  monthKey: string;
  budgetId: string | null;
  totalAllocatedCents: number;
  totalSpentCents: number;
  totalRemainingCents: number;
  percentageSpent: number;
  categories: CategoryBudgetSummary[];
}

// ============================================================================
// Helper Types
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export type MonthKey = string; // "YYYY-MM" format
