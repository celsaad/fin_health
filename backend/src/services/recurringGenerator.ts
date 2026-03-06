import { addWeeks, addMonths, addYears, isBefore, isAfter, startOfDay } from 'date-fns';
import prisma from '../lib/prisma';

function getNextDate(current: Date, frequency: string): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(current, 1);
    case 'biweekly':
      return addWeeks(current, 2);
    case 'monthly':
      return addMonths(current, 1);
    case 'yearly':
      return addYears(current, 1);
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
}

export async function generateRecurringTransactions(userId: string): Promise<number> {
  const templates = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      isActive: true,
    },
  });

  const today = startOfDay(new Date());
  let totalGenerated = 0;

  for (const template of templates) {
    // Skip if endDate has passed
    if (template.endDate && isBefore(startOfDay(template.endDate), today)) {
      continue;
    }

    // Determine start point for generation
    let nextDate: Date;
    if (template.lastGenerated) {
      nextDate = getNextDate(startOfDay(template.lastGenerated), template.frequency);
    } else {
      nextDate = startOfDay(template.startDate);
    }

    const transactionsToCreate: Array<{
      amount: typeof template.amount;
      type: typeof template.type;
      description: string;
      date: Date;
      notes: string | null;
      categoryId: string;
      subcategoryId: string | null;
      userId: string;
      recurringTransactionId: string;
    }> = [];

    // Generate all due transactions
    while (!isAfter(nextDate, today)) {
      // If endDate is set and we've passed it, stop
      if (template.endDate && isAfter(nextDate, startOfDay(template.endDate))) {
        break;
      }

      transactionsToCreate.push({
        amount: template.amount,
        type: template.type,
        description: template.description,
        date: nextDate,
        notes: template.notes,
        categoryId: template.categoryId,
        subcategoryId: template.subcategoryId,
        userId,
        recurringTransactionId: template.id,
      });

      nextDate = getNextDate(nextDate, template.frequency);
    }

    if (transactionsToCreate.length > 0) {
      await prisma.$transaction([
        prisma.transaction.createMany({
          data: transactionsToCreate,
        }),
        prisma.recurringTransaction.update({
          where: { id: template.id },
          data: {
            lastGenerated: transactionsToCreate[transactionsToCreate.length - 1].date,
          },
        }),
      ]);

      totalGenerated += transactionsToCreate.length;
    }
  }

  return totalGenerated;
}
