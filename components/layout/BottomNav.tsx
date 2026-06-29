'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Home',      href: '',           icon: LayoutDashboard, roles: ['ADMIN','SUPERVISOR','WORKER'] },
  { label: 'Inventory', href: '/inventory', icon: Package,         roles: ['ADMIN','SUPERVISOR','WORKER'] },
  { label: 'Sales',     href: '/sales',     icon: ShoppingCart,    roles: ['ADMIN','SUPERVISOR','WORKER'] },
  { label: 'Reports',   href: '/reports',   icon: BarChart3,       roles: ['ADMIN','SUPERVISOR'] },
  { label: 'Users',     href: '/users',     icon: Users,           roles: ['ADMIN'] },
];

export function BottomNav() {
  const user     = useAuthStore((s) => s.user);
  const pathname = usePathname();
  if (!user) return null;

  const base  = `/dashboard/${user.role.toLowerCase()}`;
  const items = NAV.filter((i) => i.roles.includes(user.role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden
                    bg-[var(--surface)]/90 backdrop-blur-md border-t border-[var(--border)]
                    flex items-center justify-around px-2 py-1 pb-safe">
      {items.map((item) => {
        const href     = `${base}${item.href}`;
        const isActive = item.href === '' ? pathname === base : pathname.startsWith(href);
        return (
          <Link key={item.label} href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all',
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-[var(--text-muted)]',
            )}>
            <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
