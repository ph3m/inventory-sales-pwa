import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon size={28} className="text-[var(--text-muted)]" />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
        {description && <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}
