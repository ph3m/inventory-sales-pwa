import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-slate-100  text-slate-600  dark:bg-slate-700    dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  error:   'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  info:    'bg-brand-100  text-brand-700  dark:bg-brand-900/30  dark:text-brand-400',
  purple:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
