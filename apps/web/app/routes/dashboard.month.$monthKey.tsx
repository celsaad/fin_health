/**
 * Month budget overview route
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { requireAuth } from '~/lib/auth.server';
import { createTRPCClient } from '~/lib/trpc.server';
import { formatMonthKey, getPreviousMonthKey, getNextMonthKey, format } from '@fin-health/domain';
import { Card } from '~/components/ui/Card';
import { CategoryCard } from '~/components/budget/CategoryCard';
import { ProgressBar } from '~/components/budget/ProgressBar';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  const monthKey = params.monthKey!;

  const [overview, settings] = await Promise.all([
    trpc.budgets.get.query({ monthKey }),
    trpc.settings.get.query(),
  ]);

  const previousMonthKey = getPreviousMonthKey(monthKey);
  const nextMonthKey = getNextMonthKey(monthKey);

  return json({
    overview,
    settings,
    monthKey,
    previousMonthKey,
    nextMonthKey,
  });
}

export default function MonthView() {
  const { overview, settings, monthKey, previousMonthKey, nextMonthKey } =
    useLoaderData<typeof loader>();

  const currency = settings.currency;
  const isOverBudget = overview.totalSpentCents > overview.totalAllocatedCents;

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/dashboard/month/${previousMonthKey}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Previous
        </Link>

        <h2 className="text-2xl font-bold text-gray-900">{formatMonthKey(monthKey)}</h2>

        <Link
          to={`/dashboard/month/${nextMonthKey}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Next →
        </Link>
      </div>

      {/* Total Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Total</h3>
          <span
            className={`text-3xl font-bold ${
              isOverBudget ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {format(overview.totalRemainingCents, currency)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Spent</p>
            <p className="text-xl font-semibold text-gray-900">
              {format(overview.totalSpentCents, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-xl font-semibold text-gray-900">
              {format(overview.totalAllocatedCents, currency)}
            </p>
          </div>
        </div>

        <ProgressBar
          current={overview.totalSpentCents}
          total={overview.totalAllocatedCents}
        />
      </Card>

      {/* Categories */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Categories</h3>

        {overview.categories.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">No budget allocations for this month.</p>
              <p className="text-sm text-gray-500">
                Set up your budget in the{' '}
                <Link to="/dashboard/categories" className="text-blue-600 hover:underline">
                  Categories
                </Link>{' '}
                tab.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overview.categories.map((category) => (
              <CategoryCard key={category.categoryId} category={category} currency={currency} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
