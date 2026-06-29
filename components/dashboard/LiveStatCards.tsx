'use client';

import { useRealtimeStore } from '@/store/realtime';
import { useAuthStore } from '@/store/auth';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, ShoppingCart, AlertTriangle, Store, Users, Package } from 'lucide-react';

// ─── Admin stat cards ──────────────────────────────────────────────────────────
export function AdminStatCards({
  shopCount,
  userCount,
}: {
  shopCount: number;
  userCount: number;
}) {
  const todayRevenue      = useRealtimeStore((s) => s.todayRevenue);
  const todayTransactions = useRealtimeStore((s) => s.todayTransactions);
  const monthRevenue      = useRealtimeStore((s) => s.monthRevenue);
  const lowStockCount     = useRealtimeStore((s) => s.lowStockCount);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Revenue"      value={formatCurrency(todayRevenue)} icon={DollarSign}    iconColor="brand" />
        <StatCard title="Monthly Revenue"      value={formatCurrency(monthRevenue)} icon={TrendingUp}    iconColor="green" />
        <StatCard title="Today's Transactions" value={todayTransactions}             icon={ShoppingCart}  iconColor="purple" />
        <StatCard title="Low Stock Products"   value={lowStockCount}                 icon={AlertTriangle} iconColor="amber" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Total Shops" value={shopCount} icon={Store} iconColor="brand" />
        <StatCard title="Total Users" value={userCount} icon={Users} iconColor="purple" />
      </div>
    </>
  );
}

// ─── Worker stat cards ─────────────────────────────────────────────────────────
export function WorkerStatCards({ shopId }: { shopId: string }) {
  const todayRevenue      = useRealtimeStore((s) => s.todayRevenue);
  const todayTransactions = useRealtimeStore((s) => s.todayTransactions);
  const products          = useRealtimeStore((s) => s.products);
  const lowStockCount     = useRealtimeStore((s) => s.lowStockCount);

  const shopProducts = products.filter((p) => p.shop_id === shopId);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Today's Revenue"  value={formatCurrency(todayRevenue)} icon={DollarSign}   iconColor="brand" />
      <StatCard title="Today's Sales"    value={todayTransactions}             icon={ShoppingCart} iconColor="purple" />
      <StatCard title="Products"         value={shopProducts.length}           icon={Package}      iconColor="green" />
      <StatCard title="Low Stock"        value={lowStockCount}                 icon={AlertTriangle} iconColor="amber" />
    </div>
  );
}

// ─── Supervisor stat cards ─────────────────────────────────────────────────────
export function SupervisorStatCards({ shopCount }: { shopCount: number }) {
  const todayRevenue      = useRealtimeStore((s) => s.todayRevenue);
  const todayTransactions = useRealtimeStore((s) => s.todayTransactions);
  const monthRevenue      = useRealtimeStore((s) => s.monthRevenue);
  const lowStockCount     = useRealtimeStore((s) => s.lowStockCount);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Revenue"      value={formatCurrency(todayRevenue)} icon={DollarSign}    iconColor="brand" />
        <StatCard title="Monthly Revenue"      value={formatCurrency(monthRevenue)} icon={TrendingUp}    iconColor="green" />
        <StatCard title="Today's Transactions" value={todayTransactions}             icon={ShoppingCart}  iconColor="purple" />
        <StatCard title="Low Stock Products"   value={lowStockCount}                 icon={AlertTriangle} iconColor="amber" />
      </div>
      <div className="mb-4">
        <StatCard title="Total Shops" value={shopCount} icon={Store} iconColor="brand" className="sm:max-w-xs" />
      </div>
    </>
  );
}
