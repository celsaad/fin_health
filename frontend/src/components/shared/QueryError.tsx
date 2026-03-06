import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({
  message,
  onRetry,
}: QueryErrorProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 py-12 text-center"
    >
      <AlertTriangle className="mb-3 size-6 text-destructive" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message ?? t('errors.loadFailed')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-3" />
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
