import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Insight, InsightSentiment } from '@/hooks/useDashboard';

interface InsightsCardProps {
  insights: Insight[];
}

const sentimentConfig: Record<
  InsightSentiment,
  { icon: typeof Info; iconColor: string; bgColor: string }
> = {
  positive: {
    icon: TrendingDown,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  negative: {
    icon: TrendingUp,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  neutral: {
    icon: Info,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
};

export function InsightsCard({ insights }: InsightsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.insights')}</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('dashboard.noInsights')}</p>
        ) : (
          <ul className="space-y-4" role="list" aria-label={t('dashboard.insights')}>
            {insights.map((insight) => {
              const config = sentimentConfig[insight.sentiment];
              const Icon = config.icon;
              return (
                <li key={insight.type} className="flex items-start gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
                  >
                    <Icon className={`size-5 ${config.iconColor}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
