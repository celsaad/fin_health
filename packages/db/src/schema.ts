/**
 * Database schema using Drizzle ORM
 * All tables with foreign keys, indexes, and relations
 */

import { pgTable, uuid, varchar, integer, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Users Table
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches Supabase auth.users.id
  email: varchar('email', { length: 255 }).notNull().unique(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  timezone: varchar('timezone', { length: 100 }).notNull().default('America/New_York'),
  monthStartDay: integer('month_start_day').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  subcategories: many(subcategories),
  budgets: many(budgets),
  expenses: many(expenses),
}));

// ============================================================================
// Categories Table
// ============================================================================

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('categories_user_id_idx').on(table.userId),
    userNameUnique: unique('categories_user_name_unique').on(table.userId, table.name),
  })
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  subcategories: many(subcategories),
  budgetAllocations: many(budgetAllocations),
  expenses: many(expenses),
}));

// ============================================================================
// Subcategories Table
// ============================================================================

export const subcategories = pgTable(
  'subcategories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('subcategories_user_id_idx').on(table.userId),
    categoryIdIdx: index('subcategories_category_id_idx').on(table.categoryId),
    categoryNameUnique: unique('subcategories_category_name_unique').on(
      table.categoryId,
      table.name
    ),
  })
);

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  user: one(users, {
    fields: [subcategories.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  budgetAllocations: many(budgetAllocations),
  expenses: many(expenses),
}));

// ============================================================================
// Budgets Table
// ============================================================================

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    monthKey: varchar('month_key', { length: 7 }).notNull(), // Format: "YYYY-MM"
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('budgets_user_id_idx').on(table.userId),
    userMonthKeyUnique: unique('budgets_user_month_key_unique').on(table.userId, table.monthKey),
  })
);

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  allocations: many(budgetAllocations),
}));

// ============================================================================
// Budget Allocations Table
// ============================================================================

export const budgetAllocations = pgTable(
  'budget_allocations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    subcategoryId: uuid('subcategory_id').references(() => subcategories.id, {
      onDelete: 'cascade',
    }),
    amountCents: integer('amount_cents').notNull(), // Money stored as integer cents
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    budgetIdIdx: index('budget_allocations_budget_id_idx').on(table.budgetId),
    budgetCategorySubcategoryUnique: unique('budget_allocations_budget_cat_subcat_unique').on(
      table.budgetId,
      table.categoryId,
      table.subcategoryId
    ),
  })
);

export const budgetAllocationsRelations = relations(budgetAllocations, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetAllocations.budgetId],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [budgetAllocations.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [budgetAllocations.subcategoryId],
    references: [subcategories.id],
  }),
}));

// ============================================================================
// Expenses Table
// ============================================================================

export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    amountCents: integer('amount_cents').notNull(), // Money stored as integer cents
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }), // Prevent category deletion if has expenses
    subcategoryId: uuid('subcategory_id').references(() => subcategories.id, {
      onDelete: 'restrict',
    }), // Prevent subcategory deletion if has expenses
    notes: varchar('notes', { length: 500 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('expenses_user_id_idx').on(table.userId),
    occurredAtIdx: index('expenses_occurred_at_idx').on(table.occurredAt),
    categoryIdIdx: index('expenses_category_id_idx').on(table.categoryId),
    userOccurredAtIdx: index('expenses_user_occurred_at_idx').on(table.userId, table.occurredAt),
  })
);

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [expenses.subcategoryId],
    references: [subcategories.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type BudgetAllocation = typeof budgetAllocations.$inferSelect;
export type NewBudgetAllocation = typeof budgetAllocations.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
