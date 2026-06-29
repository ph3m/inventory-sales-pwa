'use client';

import { useUIStore } from '@/store/ui';
import { Bell, X, CheckCheck } from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';

const typeColors: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100  text-amber-600  dark:bg-amber-900/30  dark:text-amber-400',
  error:   'bg-red-100    text-red-600    dark:bg-red-900/30    dark:text-red-400',
  info:    'bg-brand-100  text-brand-600  dark:bg-brand-900/30  dark:text-brand-400',
};

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead } = useUIStore();

  return (
    <div className="absolute right-0 top-full mt-2 w-80 card p-0 overflow-hidden animate-fade-in z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
        <div className="flex gap-1">
          <button onClick={markAllRead} className="btn-ghost p-1.5 text-xs gap-1 flex items-center">
            <CheckCheck size={14} /> All read
          </button>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-muted)]">
            <Bell size={24} />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n.id} className={cn('px-4 py-3', !n.read && 'bg-brand-50/50 dark:bg-brand-900/10')}>
            <div className="flex items-start gap-3">
              <span className={cn('badge mt-0.5 text-[10px] flex-shrink-0', typeColors[n.type])}>{n.type}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--text-primary)] text-xs">{n.title}</p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5 truncate">{n.message}</p>
                <p className="text-[var(--text-muted)] text-[10px] mt-1">{formatDateTime(n.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
