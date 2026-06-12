import { trpcClient } from '../lib/trpc';

export async function getRecurringTransactions() {
  return trpcClient.recurring.list.query();
}

export async function createRecurring(body: {
  amount: string;
  currency?: string;
  type: string;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  categoryName: string;
  subcategoryName?: string;
  notes?: string;
}) {
  const result = await trpcClient.recurring.create.mutate({
    amount: body.amount,
    currency: body.currency,
    type: body.type as 'expense' | 'income',
    description: body.description,
    frequency: body.frequency as 'weekly' | 'biweekly' | 'monthly' | 'yearly',
    startDate: body.startDate,
    endDate: body.endDate,
    categoryName: body.categoryName,
    subcategoryName: body.subcategoryName,
    notes: body.notes,
  });
  return result.recurringTransaction;
}

export async function updateRecurring(
  id: string,
  body: Partial<{
    amount: string;
    currency: string;
    type: string;
    description: string;
    frequency: string;
    startDate: string;
    endDate?: string | null;
    categoryName: string;
    subcategoryName?: string | null;
    notes?: string | null;
  }>,
) {
  const result = await trpcClient.recurring.update.mutate({
    id,
    ...body,
    type: body.type as 'expense' | 'income' | undefined,
    frequency: body.frequency as 'weekly' | 'biweekly' | 'monthly' | 'yearly' | undefined,
  });
  return result.recurringTransaction;
}

export async function toggleRecurring(id: string) {
  const result = await trpcClient.recurring.toggle.mutate({ id });
  return result.recurringTransaction;
}

export async function deleteRecurring(id: string) {
  return trpcClient.recurring.delete.mutate({ id });
}
