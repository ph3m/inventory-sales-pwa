'use client';

import { useRealtimeStore } from '@/store/realtime';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingCart } from 'lucide-react';

const payBadge: Record<string, 'success' | 'info' | 'purple' | 'warning'> = {
  cash: 'success', card: 'info', mobile_money: 'purple', bank_transfer: 'warning',
};

export function RecentSalesTable() {
  const sales = useRealtimeStore((s) => s.sales).slice(0, 10);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-default flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary">Recent Sales</h3>
        {sales.length > 0 && (
          <span className="text-xs text-muted">{sales.length} shown</span>
        )}
      </div>
      {sales.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No sales yet" className="py-10" />
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Worker</th><th>Shop</th><th>Total</th><th>Payment</th><th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sales.map((s) => (
                <tr key={s.id} className="animate-fade-in">
                  <td className="font-medium text-primary">{s.users?.full_name ?? '—'}</td>
                  <td>{s.shops?.name ?? '—'}</td>
                  <td className="font-mono font-semibold">{formatCurrency(s.total_amount)}</td>
                  <td>
                    <Badge variant={payBadge[s.payment_method] ?? 'default'}>
                      {s.payment_method.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="text-muted text-xs">{formatDateTime(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
