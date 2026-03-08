// ── Enums ──

export type CategoryType = 'expense' | 'income';
export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';
export type PlanType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'expired';

// ── Plan ──

export interface UserPlan {
  plan: PlanType;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

// ── Category ──

export interface Subcategory {
  id: string;
  name: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
  color?: string | null;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  subcategories: Subcategory[];
  _count: {
    transactions: number;
  };
}

// ── Transaction ──

export interface Transaction {
  id: string;
  amount: number;
  type: CategoryType;
  description: string;
  date: string;
  category: CategoryRef;
  subcategory?: Subcategory | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: CategoryType | '';
  categoryId?: string;
  subcategoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  transactions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Budget ──

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  isRecurring: boolean;
  categoryId: string | null;
  category?: Pick<CategoryRef, 'id' | 'name' | 'icon' | 'color'> | null;
  spent: number;
  remaining: number;
}

// ── Recurring Transaction ──

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  category: CategoryRef;
  subcategory?: Subcategory | null;
  notes?: string | null;
}
