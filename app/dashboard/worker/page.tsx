import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { WorkerStatCards } from '@/components/dashboard/LiveStatCards';
import { RecentSalesTable } from '@/components/dashboard/RecentSalesTable';
import { LowStockAlertWorker } from '@/components/dashboard/LowStockAlertWorker';
import { redirect } from 'next/navigation';

export default async function WorkerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users')
    .select('shop_id, shops(name)')
    .eq('id', user!.id)
    .single();

  const shopId   = profile?.shop_id;
  const shopName = (profile?.shops as any)?.name ?? '';
  if (!shopId) redirect('/auth/login');

  return (
    <DashboardShell title="My Shop">
      <div className="mb-4 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-sm text-brand-700 dark:text-brand-300 font-medium">
        📍 {shopName}
      </div>
      <WorkerStatCards shopId={shopId} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RecentSalesTable /></div>
        <div><LowStockAlertWorker shopId={shopId} shopName={shopName} /></div>
      </div>
    </DashboardShell>
  );
}
