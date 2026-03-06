import 'dotenv/config';
import { PrismaClient, CategoryType, RecurrenceFrequency } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const password = await bcrypt.hash('demo1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@finhealth.app' },
    update: {},
    create: {
      email: 'demo@finhealth.app',
      password,
      name: 'Demo User',
      currency: 'USD',
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create categories
  const expenseCategories = [
    { name: 'Housing', subs: ['Rent', 'Utilities', 'Insurance', 'Maintenance'] },
    { name: 'Food', subs: ['Groceries', 'Restaurants', 'Coffee', 'Delivery'] },
    { name: 'Transportation', subs: ['Gas', 'Public Transit', 'Parking', 'Maintenance'] },
    { name: 'Entertainment', subs: ['Movies', 'Games', 'Streaming', 'Books'] },
    { name: 'Shopping', subs: ['Clothing', 'Electronics', 'Home Goods'] },
    { name: 'Health', subs: ['Doctor', 'Pharmacy', 'Gym', 'Dental'] },
    { name: 'Education', subs: ['Courses', 'Books', 'Supplies'] },
    { name: 'Personal', subs: ['Haircut', 'Gifts', 'Subscriptions'] },
  ];

  const incomeCategories = [
    { name: 'Salary', subs: ['Base Pay', 'Bonus', 'Overtime'] },
    { name: 'Freelance', subs: ['Consulting', 'Projects'] },
  ];

  const categoryMap: Record<string, { id: string; subs: Record<string, string> }> = {};

  for (const cat of expenseCategories) {
    const created = await prisma.category.upsert({
      where: { userId_name_type: { userId: user.id, name: cat.name, type: 'expense' } },
      update: {},
      create: { name: cat.name, type: 'expense', userId: user.id },
    });
    const subsMap: Record<string, string> = {};
    for (const subName of cat.subs) {
      const sub = await prisma.subcategory.upsert({
        where: { categoryId_name: { categoryId: created.id, name: subName } },
        update: {},
        create: { name: subName, categoryId: created.id },
      });
      subsMap[subName] = sub.id;
    }
    categoryMap[cat.name] = { id: created.id, subs: subsMap };
  }

  for (const cat of incomeCategories) {
    const created = await prisma.category.upsert({
      where: { userId_name_type: { userId: user.id, name: cat.name, type: 'income' } },
      update: {},
      create: { name: cat.name, type: 'income', userId: user.id },
    });
    const subsMap: Record<string, string> = {};
    for (const subName of cat.subs) {
      const sub = await prisma.subcategory.upsert({
        where: { categoryId_name: { categoryId: created.id, name: subName } },
        update: {},
        create: { name: subName, categoryId: created.id },
      });
      subsMap[subName] = sub.id;
    }
    categoryMap[cat.name] = { id: created.id, subs: subsMap };
  }

  console.log(`Created ${Object.keys(categoryMap).length} categories`);

  // Create ~100 transactions spanning the last 6 months
  const now = new Date();
  const transactions: {
    amount: number;
    type: CategoryType;
    description: string;
    date: Date;
    categoryId: string;
    subcategoryId?: string;
    userId: string;
    notes?: string;
  }[] = [];

  const expenseTemplates = [
    { cat: 'Housing', sub: 'Rent', desc: 'Monthly rent', amount: 1500, recurring: true },
    { cat: 'Housing', sub: 'Utilities', desc: 'Electric bill', amount: 120 },
    { cat: 'Housing', sub: 'Utilities', desc: 'Water bill', amount: 45 },
    { cat: 'Housing', sub: 'Insurance', desc: 'Renters insurance', amount: 30 },
    { cat: 'Food', sub: 'Groceries', desc: 'Weekly groceries', amount: 85 },
    { cat: 'Food', sub: 'Groceries', desc: 'Costco run', amount: 150 },
    { cat: 'Food', sub: 'Restaurants', desc: 'Dinner out', amount: 55 },
    { cat: 'Food', sub: 'Coffee', desc: 'Coffee shop', amount: 6 },
    { cat: 'Food', sub: 'Delivery', desc: 'Food delivery', amount: 35 },
    { cat: 'Transportation', sub: 'Gas', desc: 'Gas fill-up', amount: 50 },
    { cat: 'Transportation', sub: 'Public Transit', desc: 'Metro pass', amount: 80 },
    { cat: 'Transportation', sub: 'Parking', desc: 'Parking garage', amount: 15 },
    { cat: 'Entertainment', sub: 'Streaming', desc: 'Netflix subscription', amount: 15.99 },
    { cat: 'Entertainment', sub: 'Streaming', desc: 'Spotify subscription', amount: 9.99 },
    { cat: 'Entertainment', sub: 'Movies', desc: 'Movie tickets', amount: 28 },
    { cat: 'Entertainment', sub: 'Games', desc: 'Video game purchase', amount: 60 },
    { cat: 'Shopping', sub: 'Clothing', desc: 'New shoes', amount: 89 },
    { cat: 'Shopping', sub: 'Electronics', desc: 'Phone charger', amount: 25 },
    { cat: 'Shopping', sub: 'Home Goods', desc: 'Kitchen supplies', amount: 40 },
    { cat: 'Health', sub: 'Gym', desc: 'Gym membership', amount: 50 },
    { cat: 'Health', sub: 'Pharmacy', desc: 'Pharmacy', amount: 20 },
    { cat: 'Health', sub: 'Doctor', desc: 'Doctor visit copay', amount: 30 },
    { cat: 'Education', sub: 'Courses', desc: 'Online course', amount: 49.99 },
    { cat: 'Personal', sub: 'Haircut', desc: 'Haircut', amount: 35 },
    { cat: 'Personal', sub: 'Subscriptions', desc: 'Cloud storage', amount: 9.99 },
  ];

  const incomeTemplates = [
    { cat: 'Salary', sub: 'Base Pay', desc: 'Bi-weekly paycheck', amount: 3200, recurring: true },
    { cat: 'Freelance', sub: 'Consulting', desc: 'Consulting work', amount: 500 },
    { cat: 'Freelance', sub: 'Projects', desc: 'Side project payment', amount: 300 },
  ];

  // Generate transactions for the last 6 months
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    // Salary - twice per month
    const salaryTemplate = incomeTemplates[0];
    for (const day of [1, 15]) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      if (date <= now) {
        transactions.push({
          amount: salaryTemplate.amount + Math.round(Math.random() * 100),
          type: 'income',
          description: salaryTemplate.desc,
          date,
          categoryId: categoryMap[salaryTemplate.cat].id,
          subcategoryId: categoryMap[salaryTemplate.cat].subs[salaryTemplate.sub],
          userId: user.id,
        });
      }
    }

    // Rent - once per month
    const rentTemplate = expenseTemplates[0];
    const rentDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    if (rentDate <= now) {
      transactions.push({
        amount: rentTemplate.amount,
        type: 'expense',
        description: rentTemplate.desc,
        date: rentDate,
        categoryId: categoryMap[rentTemplate.cat].id,
        subcategoryId: categoryMap[rentTemplate.cat].subs[rentTemplate.sub],
        userId: user.id,
      });
    }

    // Random expenses throughout the month
    const numExpenses = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numExpenses; i++) {
      const template =
        expenseTemplates[1 + Math.floor(Math.random() * (expenseTemplates.length - 1))];
      const day = 1 + Math.floor(Math.random() * 28);
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      if (date <= now) {
        const variance = 0.8 + Math.random() * 0.4;
        transactions.push({
          amount: Math.round(template.amount * variance * 100) / 100,
          type: 'expense',
          description: template.desc,
          date,
          categoryId: categoryMap[template.cat].id,
          subcategoryId: categoryMap[template.cat].subs[template.sub],
          userId: user.id,
        });
      }
    }

    // Occasional freelance income
    if (Math.random() > 0.4) {
      const template =
        incomeTemplates[1 + Math.floor(Math.random() * (incomeTemplates.length - 1))];
      const day = 5 + Math.floor(Math.random() * 20);
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      if (date <= now) {
        transactions.push({
          amount: template.amount + Math.round(Math.random() * 200),
          type: 'income',
          description: template.desc,
          date,
          categoryId: categoryMap[template.cat].id,
          subcategoryId: categoryMap[template.cat].subs[template.sub],
          userId: user.id,
        });
      }
    }
  }

  // Delete existing transactions for idempotency
  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  // Insert all transactions
  await prisma.transaction.createMany({ data: transactions });
  console.log(`Created ${transactions.length} transactions`);

  // Create budgets for current month
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgetData = [
    { amount: 5000, categoryId: null }, // Overall budget
    { amount: 1700, categoryId: categoryMap['Housing'].id },
    { amount: 600, categoryId: categoryMap['Food'].id },
    { amount: 200, categoryId: categoryMap['Transportation'].id },
    { amount: 100, categoryId: categoryMap['Entertainment'].id },
    { amount: 150, categoryId: categoryMap['Shopping'].id },
    { amount: 100, categoryId: categoryMap['Health'].id },
  ];

  await prisma.budget.deleteMany({ where: { userId: user.id } });
  for (const b of budgetData) {
    await prisma.budget.create({
      data: {
        amount: b.amount,
        month: currentMonth,
        year: currentYear,
        categoryId: b.categoryId,
        userId: user.id,
      },
    });
  }
  console.log(`Created ${budgetData.length} budgets`);

  // Create recurring transaction templates
  await prisma.recurringTransaction.deleteMany({ where: { userId: user.id } });

  const recurringData = [
    {
      amount: 1500,
      type: 'expense' as CategoryType,
      description: 'Monthly rent',
      frequency: 'monthly' as RecurrenceFrequency,
      startDate: new Date(currentYear, 0, 1),
      categoryId: categoryMap['Housing'].id,
      subcategoryId: categoryMap['Housing'].subs['Rent'],
      isActive: true,
    },
    {
      amount: 15.99,
      type: 'expense' as CategoryType,
      description: 'Netflix subscription',
      frequency: 'monthly' as RecurrenceFrequency,
      startDate: new Date(currentYear, 0, 15),
      categoryId: categoryMap['Entertainment'].id,
      subcategoryId: categoryMap['Entertainment'].subs['Streaming'],
      isActive: true,
    },
    {
      amount: 50,
      type: 'expense' as CategoryType,
      description: 'Gym membership',
      frequency: 'monthly' as RecurrenceFrequency,
      startDate: new Date(currentYear, 0, 5),
      categoryId: categoryMap['Health'].id,
      subcategoryId: categoryMap['Health'].subs['Gym'],
      isActive: true,
    },
    {
      amount: 3200,
      type: 'income' as CategoryType,
      description: 'Bi-weekly paycheck',
      frequency: 'biweekly' as RecurrenceFrequency,
      startDate: new Date(currentYear, 0, 1),
      categoryId: categoryMap['Salary'].id,
      subcategoryId: categoryMap['Salary'].subs['Base Pay'],
      isActive: true,
    },
  ];

  for (const r of recurringData) {
    await prisma.recurringTransaction.create({
      data: { ...r, userId: user.id },
    });
  }
  console.log(`Created ${recurringData.length} recurring templates`);

  console.log('\nSeed complete!');
  console.log('Login with: demo@finhealth.app / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
