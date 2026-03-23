import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePlan } from '@/hooks/usePlan';
import { useInsights } from '@/hooks/useDashboard';

interface EditorialInsightCardProps {
  month: number;
  year: number;
  className?: string;
}

function getNextMonthName(month: number, year: number): string {
  // month is 1-based; month % 12 gives next month (0-indexed for Date constructor)
  const nextYear = month === 12 ? year + 1 : year;
  return format(new Date(nextYear, month % 12, 1), 'MMMM');
}

export function EditorialInsightCard({ month, year, className }: EditorialInsightCardProps) {
  const { t } = useTranslation();
  const { isPro } = usePlan();
  const insights$ = useInsights(month, year, isPro);

  const nextMonthName = getNextMonthName(month, year);

  return (
    <Card
      className={`overflow-hidden bg-indigo-900 text-white ${className ?? ''}`}
    >
      <CardContent className="relative p-8">
        {/* Dot pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
          aria-hidden="true"
        />

        <div className="relative">
          {/* Badge */}
          <span className="inline-block rounded bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
            {t('dashboard.editorialInsight')}
          </span>

          {!isPro ? (
            /* Locked State */
            <>
              <div className="mt-4">
                <Lock className="size-6 text-amber-400" aria-hidden="true" />
              </div>
              <h3 className="mt-3 font-headline text-2xl font-bold">
                {t('dashboard.spendingForecast', { month: nextMonthName })}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-indigo-200">
                {t('plan.upgradeDescription')}
              </p>
              {/* Animated placeholder bars */}
              <div className="mt-4 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
              </div>
              <button type="button" className="mt-6 w-full rounded-lg bg-white py-3 font-bold text-indigo-900 transition-opacity hover:opacity-90">
                {t('dashboard.upgradeToPro')}
              </button>
            </>
          ) : insights$.isLoading ? (
            /* Loading State */
            <div className="mt-6 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ) : insights$.data && insights$.data.length > 0 ? (
            /* Unlocked State */
            <>
              <h3 className="mt-4 font-headline text-2xl font-bold">
                {insights$.data[0].title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-indigo-200">
                {insights$.data[0].description}
              </p>
            </>
          ) : (
            /* No insights */
            <p className="mt-4 text-sm text-indigo-200">{t('dashboard.noInsights')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
