import { trpcClient } from '../lib/trpc';

export async function getBudgets(month: number, year: number) {
  return trpcClient.budgets.list.query({ month, year });
}

export async function upsertBudget(body: {
  amount: string;
  month?: number;
  year?: number;
  categoryId?: string | null;
  isRecurring?: boolean;
}) {
  const result = await trpcClient.budgets.upsert.mutate({
    amount: body.amount,
    month: body.month,
    year: body.year,
    categoryId: body.categoryId,
    isRecurring: body.isRecurring,
  });
  return result.budget;
}

export async function deleteBudget(id: string) {
  return trpcClient.budgets.delete.mutate({ id });
}

export async function copyPreviousBudgets(month: number, year: number) {
  return trpcClient.budgets.copyPrevious.mutate({ month, year });
}
