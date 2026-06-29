'use client';

import { useRealtimeStore } from '@/store/realtime';
import { AlertTriangle, Package, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function LowStockAlertWorker({ shopId, shopName }: { shopId: string; shopName?: string }) {
  const products      = useRealtimeStore((s) => s.products);
  const upsertProduct = useRealtimeStore((s) => s.upsertProduct);
  const supabase      = createClient();

  const lowStock = products
    .filter((p) =>
      p.is_active !== false &&
      !p.hide_from_alerts &&
      p.shop_id === shopId &&
      (p.quantity === 0 || p.quantity <= p.min_stock)
    )
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 10);

  const handleDismiss = async (productId: string) => {
    const { data, error } = await supabase
      .from('products')
      .update({ hide_from_alerts: true, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select('*, shops(name)')
      .single();

    if (error) toast.error(error.message);
    else {
      upsertProduct(data);
      toast.success('Removed from alerts');
    }
  };

  return (
    <div className="card p-0 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-default flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-500" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-primary">Low Stock</h3>
          {shopName && <p className="text-xs text-muted truncate">{shopName}</p>}
        </div>
        {lowStock.length > 0 && (
          <Badge variant="warning">{lowStock.length}</Badge>
        )}
      </div>
      <div className="divide-y divide-[var(--border)]">
        {lowStock.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted">
            <Package size={24} />
            <p className="text-sm">All stock levels healthy</p>
          </div>
        ) : lowStock.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{p.name}</p>
              <p className="text-xs text-muted">min: {p.min_stock}</p>
            </div>
            <Badge variant={p.quantity === 0 ? 'error' : 'warning'}>
              {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
            </Badge>
            <button
              onClick={() => handleDismiss(p.id)}
              title="Dismiss from alerts"
              className="flex-shrink-0 p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      {lowStock.length > 0 && (
        <div className="px-5 py-2.5 border-t border-default bg-slate-50 dark:bg-slate-800/30">
          <p className="text-xs text-muted">× dismiss removes from alerts only</p>
        </div>
      )}
    </div>
  );
}
