import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SupervisorStatCards } from '@/components/dashboard/LiveStatCards';
import { AdminCharts } from '@/components/charts/AdminCharts';
import { RecentSalesTable } from '@/components/dashboard/RecentSalesTable';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { ShopBreakdownCards } from '@/components/dashboard/ShopBreakdownCards';
import { startOfDay, startOfMonth } from 'date-fns';

export default async function SupervisorDashboard() {
  const supabase   = createClient();
  const today      = startOfDay(new Date()).toISOString();
  const monthStart = startOfMonth(new Date()).toISOString();

  const [{ data: shops }, { data: allSales }, { data: allProducts }] = await Promise.all([
    supabase.from('shops').select('id, name, location'),
    supabase.from('sales').select('shop_id, total_amount, created_at').gte('created_at', monthStart),
    supabase.from('products').select('shop_id, quantity, min_stock, is_active').eq('is_active', true),
  ]);

  // Build per-shop stats
  const shopStats = (shops ?? []).map((shop) => {
    const shopSales   = (allSales ?? []).filter((s) => s.shop_id === shop.id);
    const todaySales  = shopSales.filter((s) => s.created_at >= today);
    const shopProducts = (allProducts ?? []).filter((p) => p.shop_id === shop.id);
    const lowStock    = shopProducts.filter((p) => p.quantity <= p.min_stock);

    return {
      id:               shop.id,
      name:             shop.name,
      location:         shop.location,
      monthRevenue:     shopSales.reduce((s, r) => s + r.total_amount, 0),
      todayRevenue:     todaySales.reduce((s, r) => s + r.total_amount, 0),
      todayTransactions: todaySales.length,
      monthTransactions: shopSales.length,
      productCount:     shopProducts.length,
      lowStockCount:    lowStock.length,
    };
  });

  return (
    <DashboardShell title="Overview">
      <div className="mb-4 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm text-purple-700 dark:text-purple-300">
        <span className="font-medium">Supervisor view</span> — read-only, updates live
      </div>

      {/* Overall stats */}
      <SupervisorStatCards shopCount={shops?.length ?? 0} />

      {/* Per-shop breakdown */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Shop Breakdown</h2>
        <ShopBreakdownCards shopStats={shopStats} />
      </div>

      {/* Charts */}
      <div className="mb-6"><AdminCharts /></div>

      {/* Recent sales + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RecentSalesTable /></div>
        <div><LowStockAlert /></div>
      </div>
    </DashboardShell>
  );
}
