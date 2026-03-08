import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlan } from '@/hooks/usePlan';

interface ProGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function UpgradePrompt() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-5" aria-hidden="true" />
          {t('plan.upgradeTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t('plan.upgradeDescription')}</p>
      </CardContent>
    </Card>
  );
}

export function ProGate({ children, fallback }: ProGateProps) {
  const { isPro } = usePlan();

  if (isPro) {
    return <>{children}</>;
  }

  return <>{fallback ?? <UpgradePrompt />}</>;
}
