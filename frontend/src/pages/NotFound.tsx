import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">{t('notFound.code')}</p>
      <h1 className="mt-4 text-2xl font-semibold">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t('notFound.description')}</p>
      <Button asChild className="mt-6">
        <Link to="/">
          <Home className="size-4" />
          {t('notFound.backToDashboard')}
        </Link>
      </Button>
    </div>
  );
}
