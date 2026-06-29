export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-28" />
            </div>
          </div>
        ))}
      </div>
      {/* Chart placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="card h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
      {/* Table placeholder */}
      <div className="card p-0 overflow-hidden">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 border-b border-[var(--border)]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-[var(--border)]">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Search bar placeholder */}
      <div className="flex justify-between gap-3">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-56" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-28" />
      </div>
      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}><div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-16" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c}><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
