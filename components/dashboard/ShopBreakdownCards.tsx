'use client';

import { formatCurrency } from '@/lib/utils';
import { DollarSign, ShoppingCart, Package, AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ShopStat {
  id: string;
  name: string;
  location: string;
  monthRevenue: number;
  todayRevenue: number;
  todayTransactions: number;
  monthTransactions: number;
  productCount: number;
  lowStockCount: number;
}

export function ShopBreakdownCards({ shopStats }: { shopStats: ShopStat[] }) {
  if (shopStats.length === 0) {
    return (
      <div className="text-sm text-muted py-6 text-center">No shops found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {shopStats.map((shop) => (
        <div key={shop.id} className="card space-y-4">
          {/* Shop header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-primary">{shop.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                <MapPin size={11} />
                {shop.location}
              </div>
            </div>
            {shop.lowStockCount > 0 && (
              <Badge variant="warning">
                {shop.lowStockCount} low stock
              </Badge>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={13} className="text-brand-500" />
                <span className="text-xs text-muted">Today's Revenue</span>
              </div>
              <p className="text-base font-bold text-primary">{formatCurrency(shop.todayRevenue)}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={13} className="text-emerald-500" />
                <span className="text-xs text-muted">Monthly Revenue</span>
              </div>
              <p className="text-base font-bold text-primary">{formatCurrency(shop.monthRevenue)}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={13} className="text-purple-500" />
                <span className="text-xs text-muted">Today's Sales</span>
              </div>
              <p className="text-base font-bold text-primary">{shop.todayTransactions}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={13} className="text-slate-500" />
                <span className="text-xs text-muted">Monthly Sales</span>
              </div>
              <p className="text-base font-bold text-primary">{shop.monthTransactions}</p>
            </div>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-2 border-t border-default text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <Package size={12} />
              <span>{shop.productCount} products</span>
            </div>
            {shop.lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={12} />
                <span>{shop.lowStockCount} need restocking</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
