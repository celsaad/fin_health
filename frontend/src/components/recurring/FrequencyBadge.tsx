import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FrequencyBadgeProps {
  frequency: string;
}

const frequencyStyles: Record<string, string> = {
  weekly: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  biweekly: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  monthly: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  yearly: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const frequencyKeys: Record<string, string> = {
  weekly: 'recurring.weekly',
  biweekly: 'recurring.biweekly',
  monthly: 'recurring.monthly',
  yearly: 'recurring.yearly',
};

export function FrequencyBadge({ frequency }: FrequencyBadgeProps) {
  const { t } = useTranslation();
  const className =
    frequencyStyles[frequency] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  const label = frequencyKeys[frequency] ? t(frequencyKeys[frequency]) : frequency;

  return (
    <Badge variant="secondary" className={cn('border-0', className)}>
      {label}
    </Badge>
  );
}
