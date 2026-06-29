import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AdminStatCards } from '@/components/dashboard/LiveStatCards';
import { AdminCharts } from '@/components/charts/AdminCharts';
import { RecentSalesTable } from '@/components/dashboard/RecentSalesTable';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Only fetch stable counts (shops/users) server-side
  // Everything else (revenue, stock) is live from the realtime store
  const [{ data: shops }, { data: users }] = await Promise.all([
    supabase.from('shops').select('id'),
    supabase.from('users').select('id'),
  ]);

  return (
    <DashboardShell title="Admin Overview">
      <AdminStatCards
        shopCount={shops?.length ?? 0}
        userCount={users?.length ?? 0}
      />
      <div className="mb-6"><AdminCharts /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RecentSalesTable /></div>
        <div><LowStockAlert /></div>
      </div>
    </DashboardShell>
  );
}
