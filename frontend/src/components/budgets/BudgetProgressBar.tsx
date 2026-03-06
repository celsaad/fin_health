import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
}

export function BudgetProgressBar({ spent, budget }: BudgetProgressBarProps) {
  const { t } = useTranslation();
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const clampedPercentage = Math.min(percentage, 100);

  const getColorClass = () => {
    if (percentage > 100) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getIndicatorColor = () => {
    if (percentage > 100) return '[&_[data-slot=progress-indicator]]:bg-red-500';
    if (percentage >= 75) return '[&_[data-slot=progress-indicator]]:bg-yellow-500';
    return '[&_[data-slot=progress-indicator]]:bg-green-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            Number(spent),
          )}{' '}
          {t('budgets.spent')}
        </span>
        <span className={cn('font-medium', getColorClass())}>{percentage}%</span>
      </div>
      <Progress value={clampedPercentage} className={cn('h-2', getIndicatorColor())} />
    </div>
  );
}
