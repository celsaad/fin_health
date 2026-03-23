export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  transactionCount: number;
}

export interface BreakdownItem {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  transactionCount?: number;
  icon: string | null;
  color: string | null;
}

export interface TrendItem {
  month: number;
  year: number;
  income: number;
  expense: number;
}
