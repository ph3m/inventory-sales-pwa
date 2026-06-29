'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';

// Lazy load Recharts — it's heavy (~500kb), don't block first paint
const LineChart      = dynamic(() => import('recharts').then((m) => m.LineChart),      { ssr: false });
const Line           = dynamic(() => import('recharts').then((m) => m.Line),           { ssr: false });
const BarChart       = dynamic(() => import('recharts').then((m) => m.BarChart),       { ssr: false });
const Bar            = dynamic(() => import('recharts').then((m) => m.Bar),            { ssr: false });
const XAxis          = dynamic(() => import('recharts').then((m) => m.XAxis),          { ssr: false });
const YAxis          = dynamic(() => import('recharts').then((m) => m.YAxis),          { ssr: false });
const CartesianGrid  = dynamic(() => import('recharts').then((m) => m.CartesianGrid),  { ssr: false });
const Tooltip        = dynamic(() => import('recharts').then((m) => m.Tooltip),        { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

export function AdminCharts() {
  const [data, setData]       = useState<{ date: string; revenue: number; transactions: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase              = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const from = startOfDay(subDays(new Date(), 13)).toISOString();
      const { data: sales } = await supabase
        .from('sales').select('total_amount, created_at').gte('created_at', from);

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
    contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' },
    labelStyle:   { color: 'var(--text-primary)', fontWeight: 600 },
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
      <div className="card">
        <h3 className="text-sm font-semibold text-primary mb-4">Revenue — Last 14 days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tt} formatter={(v: number) => [`TZS ${v.toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h3 className="text-sm font-semibold text-primary mb-4">Transactions — Last 14 days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
            <Tooltip {...tt} />
            <Bar dataKey="transactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
