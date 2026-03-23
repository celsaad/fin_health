import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Bell, HelpCircle } from 'lucide-react';
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
    <header className="flex h-16 items-center justify-between bg-white/70 backdrop-blur-xl px-4 lg:px-6 shadow-sm dark:bg-[hsl(222,47%,11%)]/70">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold lg:hidden">{t('auth.appName')}</h1>
        <h2 className="hidden text-lg font-semibold lg:block">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
          aria-label={t('common.notifications')}
        >
          <Bell className="size-5" />
        </button>
        <button
          className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
          aria-label={t('common.help')}
        >
          <HelpCircle className="size-5" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
