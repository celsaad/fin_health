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

  const allInserts: Array<{
    amount: (typeof templates)[number]['amount'];
    type: (typeof templates)[number]['type'];
    description: string;
    date: Date;
    notes: string | null;
    categoryId: string;
    subcategoryId: string | null;
    userId: string;
    recurringTransactionId: string;
  }> = [];
  const templateUpdates: Array<{ id: string; lastGenerated: Date }> = [];

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

    let lastDate: Date | null = null;

    // Generate all due transactions
    while (!isAfter(nextDate, today)) {
      // If endDate is set and we've passed it, stop
      if (template.endDate && isAfter(nextDate, startOfDay(template.endDate))) {
        break;
      }

      allInserts.push({
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

      lastDate = nextDate;
      nextDate = getNextDate(nextDate, template.frequency);
    }

    if (lastDate) {
      templateUpdates.push({ id: template.id, lastGenerated: lastDate });
    }
  }

  if (allInserts.length === 0) return 0;

  await prisma.$transaction([
    prisma.transaction.createMany({ data: allInserts }),
    ...templateUpdates.map((u) =>
      prisma.recurringTransaction.update({
        where: { id: u.id },
        data: { lastGenerated: u.lastGenerated },
      })
    ),
  ]);

  return allInserts.length;
}
