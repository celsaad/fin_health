import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  Tag,
  PiggyBank,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', labelKey: 'nav.home', icon: LayoutDashboard, end: true },
  { to: '/spending', labelKey: 'nav.spending', icon: BarChart3 },
  { to: '/transactions', labelKey: 'nav.txns', icon: ArrowLeftRight },
  { to: '/categories', labelKey: 'nav.tags', icon: Tag },
  { to: '/budgets', labelKey: 'nav.budgets', icon: PiggyBank },
  { to: '/recurring', labelKey: 'nav.recurring', icon: RefreshCw },
];

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <item.icon className="size-5" aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
