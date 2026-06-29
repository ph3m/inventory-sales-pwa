'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import {
  LayoutDashboard, Store, Package, ShoppingCart,
  BarChart3, Users, Settings, X, ChevronRight, Boxes,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard', href: '',           icon: LayoutDashboard, roles: ['ADMIN','SUPERVISOR','WORKER'] },
  { label: 'Shops',     href: '/shops',     icon: Store,           roles: ['ADMIN','SUPERVISOR'] },
  { label: 'Inventory', href: '/inventory', icon: Package,         roles: ['ADMIN','SUPERVISOR','WORKER'] },
  { label: 'Sales',     href: '/sales',     icon: ShoppingCart,    roles: ['ADMIN','SUPERVISOR','WORKER'] },
  { label: 'Reports',   href: '/reports',   icon: BarChart3,       roles: ['ADMIN','SUPERVISOR'] },
  { label: 'Users',     href: '/users',     icon: Users,           roles: ['ADMIN'] },
  { label: 'Settings',  href: '/settings',  icon: Settings,        roles: ['ADMIN'] },
];

export function Sidebar() {
  const user                        = useAuthStore((s) => s.user);
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const pathname                    = usePathname();

  if (!user) return null;

  const base     = `/dashboard/${user.role.toLowerCase()}`;
  const filtered = NAV.filter((i) => i.roles.includes(user.role));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-30 h-full w-64 flex flex-col',
        'bg-[var(--surface)] border-r border-[var(--border)]',
        'transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Boxes size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-[var(--text-primary)]">Mary Shop</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1.5 lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            Navigation
          </p>
          {filtered.map((item) => {
            const href     = `${base}${item.href}`;
            const isActive = item.href === '' ? pathname === base : pathname.startsWith(href);
            return (
              <Link key={item.label} href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn('nav-item group', isActive && 'active')}>
                <item.icon size={18} className={cn('flex-shrink-0', isActive && 'text-brand-600 dark:text-brand-400')} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-brand-500" />}
              </Link>
            );
          })}
        </nav>

        {/* User chip */}
        <div className="px-3 py-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                {user.full_name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.full_name}</p>
              <p className="text-xs text-[var(--text-muted)]">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
