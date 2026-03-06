import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  Tag,
  PiggyBank,
  RefreshCw,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/spending', labelKey: 'nav.spending', icon: BarChart3 },
  { to: '/transactions', labelKey: 'nav.transactions', icon: ArrowLeftRight },
  { to: '/categories', labelKey: 'nav.categories', icon: Tag },
  { to: '/budgets', labelKey: 'nav.budgets', icon: PiggyBank },
  { to: '/recurring', labelKey: 'nav.recurring', icon: RefreshCw },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true',
  );

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', String(next));
      return next;
    });
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col bg-sidebar-background transition-all duration-200',
        collapsed ? 'lg:w-16' : 'lg:w-64',
      )}
    >
      <div className="flex h-16 items-center px-6">
        {!collapsed && <h1 className="text-xl font-bold text-white tracking-tight">FinHealth</h1>}
      </div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? t(item.labelKey) : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'gap-3',
                isActive
                  ? 'bg-sidebar-accent text-white'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white',
              )
            }
          >
            <item.icon className="size-5 shrink-0" aria-hidden="true" />
            {!collapsed && t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-3 py-3">
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-white',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <>
              <PanelLeftClose className="size-5" />
              {t('common.collapse')}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
