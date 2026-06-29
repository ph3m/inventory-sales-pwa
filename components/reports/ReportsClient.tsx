'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';
import { DollarSign, ShoppingCart, TrendingUp, Download } from 'lucide-react';

interface ReportsClientProps {
  dailyData:         { date: string; revenue: number; profit: number; transactions: number }[];
  topProducts:       { name: string; qty: number; revenue: number }[];
  totalRevenue:      number;
  totalTransactions: number;
}

export function ReportsClient({ dailyData, topProducts, totalRevenue, totalTransactions }: ReportsClientProps) {
  const [activeChart, setActiveChart] = useState<'revenue' | 'transactions'>('revenue');
  const totalProfit = dailyData.reduce((s, d) => s + d.profit, 0);

  const exportCSV = () => {
    const headers = ['Date', 'Revenue (TZS)', 'Profit (TZS)', 'Transactions'];
    const rows    = dailyData.map((d) => [d.date, d.revenue, d.profit, d.transactions]);
    const csv     = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tt = {
    contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' },
    labelStyle:   { color: 'var(--text-primary)', fontWeight: 600 },
  };

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">Monthly Summary</h2>
        <button onClick={exportCSV} className="btn-secondary text-xs">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Monthly Revenue"     value={formatCurrency(totalRevenue)}      icon={DollarSign}  iconColor="brand" />
        <StatCard title="Monthly Profit"      value={formatCurrency(totalProfit)}       icon={TrendingUp}  iconColor="green" />
        <StatCard title="Total Transactions"  value={formatNumber(totalTransactions)}   icon={ShoppingCart} iconColor="purple" />
      </div>

      {/* Line / Bar chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-primary">Daily Revenue &amp; Profit</h3>
          <div className="flex gap-1">
            {(['revenue', 'transactions'] as const).map((t) => (
              <button key={t} onClick={() => setActiveChart(t)}
                className={`btn text-xs ${activeChart === t ? 'btn-primary' : 'btn-secondary'}`}>
                {t === 'revenue' ? 'Revenue' : 'Transactions'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          {activeChart === 'revenue' ? (
            <LineChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tt} formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="profit"  stroke="#10b981" strokeWidth={2}   dot={false} name="Profit" strokeDasharray="4 2" />
            </LineChart>
          ) : (
            <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip {...tt} />
              <Bar dataKey="transactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Transactions" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Top products */}
      <div className="card">
        <h3 className="text-sm font-semibold text-primary mb-4">Top Selling Products</h3>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No sales data for this month</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-primary truncate">{p.name}</span>
                    <span className="text-secondary ml-2 flex-shrink-0">{p.qty} units</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                      style={{ width: `${(p.qty / (topProducts[0]?.qty ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-mono font-semibold text-primary flex-shrink-0">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
