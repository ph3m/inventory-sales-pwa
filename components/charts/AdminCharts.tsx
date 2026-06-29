'use client';

/**
 * AdminCharts — Revenue & Transactions line/bar charts for the admin dashboard.
 *
 * WHY no dynamic() here:
 *   • This file is already 'use client', so there is no SSR to worry about.
 *   • next.config.js already lists 'recharts' in optimizePackageImports, which
 *     makes Next.js split it into its own async chunk automatically.
 *   • dynamic() on Recharts *primitive* components (Line, Bar, XAxis …) breaks
 *     TypeScript because those components carry extra props (e.g. legendType: string)
 *     that are incompatible with the ComponentType<Props> signature next/dynamic expects.
 *   • The chart container itself (LineChart, BarChart) wrapped in a single
 *     dynamic() would work, but is unnecessary given the config-level optimization.
 */
import { useEffect, useState } from 'react';
import {
  LineChart, Line,
  BarChart,  Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';

type ChartRow = { date: string; revenue: number; transactions: number };

export function AdminCharts() {
  const [data, setData]       = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase              = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const from = startOfDay(subDays(new Date(), 13)).toISOString();
      const { data: sales } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .gte('created_at', from);

      const map: Record<string, { revenue: number; transactions: number }> = {};
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM dd');
        map[d] = { revenue: 0, transactions: 0 };
      }
      (sales ?? []).forEach((s) => {
        const d = format(new Date(s.created_at), 'MMM dd');
        if (map[d]) { map[d].revenue += s.total_amount; map[d].transactions += 1; }
      });
      setData(Object.entries(map).map(([date, v]) => ({ date, ...v })));
      setLoading(false);
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tt = {
    contentStyle: {
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: '12px',
      fontSize:     '12px',
    },
    labelStyle: { color: 'var(--text-primary)', fontWeight: 600 },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card h-56 animate-pulse bg-slate-100 dark:bg-slate-800" />
        <div className="card h-56 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-primary mb-4">Revenue — Last 14 days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              {...tt}
              formatter={(v: number) => [`TZS ${v.toLocaleString()}`, 'Revenue']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-primary mb-4">Transactions — Last 14 days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              allowDecimals={false}
            />
            <Tooltip {...tt} />
            <Bar dataKey="transactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
