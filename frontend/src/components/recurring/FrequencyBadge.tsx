import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FrequencyBadgeProps {
  frequency: string;
}

const frequencyConfig: Record<string, { label: string; className: string }> = {
  weekly: {
    label: 'Weekly',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  biweekly: {
    label: 'Biweekly',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  monthly: {
    label: 'Monthly',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  yearly: {
    label: 'Yearly',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
};

export function FrequencyBadge({ frequency }: FrequencyBadgeProps) {
  const config = frequencyConfig[frequency] ?? {
    label: frequency,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <Badge variant="secondary" className={cn('border-0', config.className)}>
      {config.label}
    </Badge>
  );
}
