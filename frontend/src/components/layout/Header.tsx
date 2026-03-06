import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { UserMenu } from '@/components/layout/UserMenu';

const pageTitleKeys: Record<string, string> = {
  '/': 'dashboard.title',
  '/spending': 'spending.title',
  '/transactions': 'transactions.title',
  '/categories': 'categories.title',
  '/budgets': 'budgets.title',
  '/recurring': 'recurring.title',
  '/settings': 'settings.title',
};

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const titleKey = pageTitleKeys[location.pathname];
  const title = titleKey ? t(titleKey) : t('auth.appName');

  return (
    <header className="flex h-16 items-center justify-between bg-card px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold lg:hidden">{t('auth.appName')}</h1>
        <h2 className="hidden text-lg font-semibold lg:block">{title}</h2>
      </div>
      <UserMenu />
    </header>
  );
}
