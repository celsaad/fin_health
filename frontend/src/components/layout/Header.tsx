import { useLocation } from 'react-router-dom';
import { UserMenu } from '@/components/layout/UserMenu';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/spending': 'Spending',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/budgets': 'Budgets',
  '/recurring': 'Recurring Transactions',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'FinHealth';

  return (
    <header className="flex h-16 items-center justify-between bg-card px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold lg:hidden">FinHealth</h1>
        <h2 className="hidden text-lg font-semibold lg:block">{title}</h2>
      </div>
      <UserMenu />
    </header>
  );
}
