import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';

interface ProGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function UpgradePrompt() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Lock className="size-5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{t('plan.upgradeTitle')}</p>
        <p className="text-xs text-muted-foreground">{t('plan.upgradeDescription')}</p>
      </div>
      <Button size="sm" onClick={() => navigate('/settings')} className="shrink-0">
        {t('plan.upgradeCta')}
      </Button>
    </div>
  );
}

export function ProGate({ children, fallback }: ProGateProps) {
  const { isPro } = usePlan();

  if (isPro) {
    return <>{children}</>;
  }

  return <>{fallback ?? <UpgradePrompt />}</>;
}
