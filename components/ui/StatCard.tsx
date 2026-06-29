import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: 'brand' | 'green' | 'amber' | 'red' | 'purple';
  change?: number;
  changeLabel?: string;
  className?: string;
}

const iconStyles: Record<string, string> = {
  brand:  'bg-brand-100  text-brand-600  dark:bg-brand-900/30  dark:text-brand-400',
  green:  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber:  'bg-amber-100  text-amber-600  dark:bg-amber-900/30  dark:text-amber-400',
  red:    'bg-red-100    text-red-600    dark:bg-red-900/30    dark:text-red-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export function StatCard({ title, value, icon: Icon, iconColor = 'brand', change, changeLabel, className }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className={cn('stat-card animate-slide-up', className)}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconStyles[iconColor])}>
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-primary mt-0.5 leading-tight break-words">{value}</p>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs mt-1 font-medium',
            isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-muted',
          )}>
            {isPositive ? <TrendingUp size={13} /> : isNegative ? <TrendingDown size={13} /> : <Minus size={13} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
            {changeLabel && <span className="font-normal text-muted">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
