import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('inline-block border-2 border-current border-t-transparent rounded-full animate-spin w-5 h-5', className)} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="w-8 h-8 text-brand-500" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>{Array.from({ length: cols }).map((_, i) => <th key={i}><div className="skeleton h-3 w-20" /></th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>{Array.from({ length: cols }).map((_, c) => <td key={c}><div className="skeleton h-4 w-full" /></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
