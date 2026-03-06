import { useState } from 'react';
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
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/spending', label: 'Spending', icon: BarChart3 },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/recurring', label: 'Recurring', icon: RefreshCw },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
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
        collapsed ? 'lg:w-16' : 'lg:w-64'
      )}
    >
      <div className="flex h-16 items-center px-6">
        {!collapsed && (
          <h1 className="text-xl font-bold text-white tracking-tight">FinHealth</h1>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'gap-3',
                isActive
                  ? 'bg-sidebar-accent text-white'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
              )
            }
          >
            <item.icon className="size-5 shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-3 py-3">
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-white',
            collapsed ? 'justify-center' : 'gap-3'
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <>
              <PanelLeftClose className="size-5" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
